use actix_web::{web, App, HttpResponse, HttpServer, Responder};
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

struct AppState {
    db: Arc<Surreal<surrealdb::engine::local::Db>>,
}

async fn submit_form(
    data: web::Json<FormData>,
    app_state: web::Data<AppState>,
) -> impl Responder {
    let created: Vec<Record> = app_state
        .db
        .create("submissions")
        .content(FormData {
            name: data.name.clone(),
            email: data.email.clone(),
            message: data.message.clone(),
        })
        .await
        .unwrap();

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
    let db = Surreal::new::<Mem>(()).await.unwrap();
    db.use_ns("form_ns").use_db("form_db").await.unwrap();

    let app_state = web::Data::new(AppState { db: Arc::new(db) });

    println!("Server running at http://localhost:8080");
    println!("Open index.html in your browser to use the form");

    HttpServer::new(move || {
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
