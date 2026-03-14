# System Architecture

This document describes system architecture (workflow) of the Conference Registration System. The system has  a client side architecture where the user interface communicates directly with Firebase services using the Firebase Web SDK. The platform consists of three principal layers:
1. Client Layer – browser interface built with HTML, CSS, and JavaScript
2. Application Logic Layer – frontend scripts handling form validation, authentication, and database operations
3. Backend Services Layer – firebase services including Firestore and Authentication

## Hgh level system flow

```mermaid
sequenceDiagram
participant U as User
participant B as Browser
participant F as Frontend (HTML/JS)
participant A as Firebase Auth
participant D as Firestore Database

U->>B: Visit conference website
B->>F: Load index.html
F->>B: Render conference homepage

U->>F: Navigate to Registration Page
F->>B: Display registration.html form

U->>F: Fill registration form
F->>F: Validate inputs
F->>D: saveRegistration(data)
D->>F: Confirm document creation
F->>U: Show registration success message

U->>B: Admin navigates to login.html
B->>F: Load login page
U->>F: Enter admin credentials
F->>A: Authenticate user
A->>F: Authentication success

F->>B: Redirect to dashboard.html
B->>F: Load admin dashboard
F->>D: Request registrations collection
D->>F: Return registration records
F->>B: Render registrations table
```

## User workflow

1. The user opens the conference website in a web browser.
2. The browser loads the main entry page (`index.html`).
3. The user navigates to the registration page (`registration.html`).
4. The user enters their personal details in the registration form.
5. The frontend JavaScript performs basic validation.
6. The form data is sent to the Firestore database using the Firebase SDK.
7. Firestore creates a new document within the `registrations` collection.
8. The user receives a confirmation that the registration has been recorded.

## Admin workflow

1. The administrator opens the login page (`login.html`).
2. The administrator enters valid email and password credentials.
3. The credentials are verified using Firebase Authentication.
4. Upon successful authentication, the user session is established.
5. The administrator is redirected to the dashboard (`dashboard.html`).
6. The dashboard queries Firestore for the `registrations` collection.
7. Registration records are retrieved and rendered in a tabular format.

## Data flow b/w front and back

```mermaid
sequenceDiagram
participant User
participant WebApp
participant FirebaseSDK
participant Firestore

User->>WebApp: Submit registration form
WebApp->>FirebaseSDK: Call saveRegistration()
FirebaseSDK->>Firestore: Create new document
Firestore->>FirebaseSDK: Confirm write
FirebaseSDK->>WebApp: Return success
WebApp->>User: Display confirmation
```

## Auth flow

Administrative authentication is handled entirely through Firebase Authentication.

```mermaid
sequenceDiagram
participant Admin
participant LoginPage
participant FirebaseAuth
participant Dashboard

Admin->>LoginPage: Enter email and password
LoginPage->>FirebaseAuth: signInWithEmailAndPassword()
FirebaseAuth->>LoginPage: Authentication success
LoginPage->>Dashboard: Redirect to dashboard
Dashboard->>FirebaseAuth: Verify session
FirebaseAuth->>Dashboard: User authenticated
```

## Security model

There are policies through Firebase security rules, they are:
* Public users are permitted to submit registrations
* Only authenticated administrators may read registration data

Example,

```text
Public Access - create registration documents
Admin Access - read registration documents
```

This approach ensures, the database remains protected while still allowing open registration for conference participants.
