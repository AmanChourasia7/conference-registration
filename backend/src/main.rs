use actix_web::{web, App, HttpResponse, HttpServer, Responder, http::StatusCode};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use surrealdb::engine::local::Mem;
use surrealdb::Surreal;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
struct FormData {
    name: String,
    email: String,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Record {
    #[allow(dead_code)]
    id: surrealdb::sql::Thing,
}

#[derive(Debug, Serialize, Deserialize)]
struct SubmissionResponse {
    id: String,
    name: String,
    email: String,
    message: String,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

struct AppState {
    db: Arc<Surreal<surrealdb::engine::local::Db>>,
}

fn validate_form_data(data: &FormData) -> Result<(), String> {
    if data.name.trim().is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    if data.name.len() > 100 {
        return Err("Name is too long (max 100 characters)".to_string());
    }
    if data.email.trim().is_empty() {
        return Err("Email cannot be empty".to_string());
    }
    if !data.email.contains('@') {
        return Err("Invalid email format".to_string());
    }
    if data.email.len() > 255 {
        return Err("Email is too long (max 255 characters)".to_string());
    }
    if data.message.trim().is_empty() {
        return Err("Message cannot be empty".to_string());
    }
    if data.message.len() > 1000 {
        return Err("Message is too long (max 1000 characters)".to_string());
    }
    Ok(())
}

async fn submit_form(
    data: web::Json<FormData>,
    app_state: web::Data<AppState>,
) -> impl Responder {
    // Validate input
    if let Err(err) = validate_form_data(&data) {
        return HttpResponse::build(StatusCode::BAD_REQUEST)
            .json(ErrorResponse { error: err });
    }

    // Store in database
    let created: Vec<Record> = match app_state
        .db
        .create("submissions")
        .content(FormData {
            name: data.name.clone(),
            email: data.email.clone(),
            message: data.message.clone(),
        })
        .await
    {
        Ok(records) => records,
        Err(e) => {
            return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
                .json(ErrorResponse {
                    error: format!("Database error: {}", e),
                });
        }
    };

    let response = SubmissionResponse {
        id: created[0].id.to_string(),
        name: data.name.clone(),
        email: data.email.clone(),
        message: data.message.clone(),
    };

    HttpResponse::Ok().json(response)
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "message": "Server is running"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server...");

    // Initialize SurrealDB
    let db = Surreal::new::<Mem>(()).await.map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to initialize SurrealDB: {}", e),
        )
    })?;
    
    db.use_ns("form_ns").use_db("form_db").await.map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to set namespace/database: {}", e),
        )
    })?;

    let app_state = web::Data::new(AppState { db: Arc::new(db) });

    println!("Server running at http://localhost:8080");
    println!("Open index.html in your browser to use the form");

    HttpServer::new(move || {
        // WARNING: CORS is configured for development only
        // For production, configure specific allowed origins
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .route("/submit", web::post().to(submit_form))
            .route("/health", web::get().to(health_check))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
