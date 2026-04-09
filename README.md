# Smart Queue & Token Management System

## Overview
Smart Queue & Token Management System is a full-stack queue automation project for banks, hospitals, colleges, and public service centers. It replaces manual queue handling with digital token generation, live queue tracking, multiple service counters, and role-based dashboards for customers, operators, managers, and administrators.

The stack:
- Backend: Java, Spring Boot, Spring Data JPA, Spring Security
- Frontend: React, Vite, Tailwind CSS, Axios
- Database: PostgreSQL
- Architecture: MVC with REST APIs, DTOs, factory, and strategy patterns

## Problem It Solves
Manual queue handling often causes:
- long waiting lines
- poor visibility into queue position
- slow handling of priority customers
- inefficient counter usage
- limited operational monitoring

This system digitizes the queue lifecycle from token generation through completion and monitoring.

## Core Roles
### Customer
- Register with any valid email address
- Generate regular or priority tokens for `GENERAL`, `ACCOUNT`, or `LOAN`
- View only personal tokens
- Track live token status and queue position
- Receive token-called notification messaging in the dashboard
- Submit feedback after token completion

### Operator
- View the live waiting queue
- Select and work from a service counter
- Call the next token based on priority-aware ordering
- Move tokens through `CALLED`, `IN_SERVICE`, and `COMPLETED`
- Skip tokens when allowed
- Process only the token currently assigned to the selected counter

### Manager
- Monitor queue statistics and service flow
- View waiting, called, in-service, completed, skipped, and priority counts
- Monitor active counters and current token assignments
- Identify possible service bottlenecks from live counter activity

### Administrator
- Create, update, and delete users
- Assign and update roles: `CUSTOMER`, `OPERATOR`, `MANAGER`, `ADMIN`
- Create, update, and delete service counters
- View users, counters, queue statistics, and system-wide activity
- Enforce role-based operational access through the secured backend

## Main Functionalities
### Token Management
- Digital token generation
- Regular and priority token support
- Priority levels: `SENIOR_CITIZEN`, `EMERGENCY`, `DIFFERENTLY_ABLED`
- Queue ordering using a priority-first, FIFO-within-priority strategy
- Token lifecycle tracking:
  `Generated -> Waiting -> Called -> In Service -> Completed`
  Alternate path:
  `Waiting/Called -> Skipped`

### Queue Monitoring
- Live queue list
- Waiting, called, in-service, completed, and skipped counts
- Priority token count
- Counter status and current token visibility
- Near real-time dashboard refresh across roles

### Authentication and Access Control
- Login for existing users
- Customer self-registration with any email ID
- JWT-based authenticated API access
- Role-protected backend endpoints
- Customer token ownership protection

### Feedback and Notifications
- Dashboard notification message when a token is called or its status changes
- Feedback submission for completed tokens only
- One feedback entry per completed token
- Feedback restricted to the token owner

### Counter Management
- Multiple service counters
- Open/closed counter status
- Current token assignment per counter
- Admin counter CRUD operations

## Current Backend API
Base URL:
`http://localhost:8080/api`

### Auth
- `POST /auth/login`
  Login with email and password
- `POST /auth/register/customer`
  Create a new customer account and log in immediately
- `GET /auth/test`
  Simple API test endpoint

### Tokens
- `POST /tokens/generate`
  Generate a new token for the authenticated customer
- `GET /tokens/my`
  Get tokens for the authenticated customer
- `GET /tokens/queue`
  Get ordered waiting queue
- `GET /tokens/status/{tokenNumber}`
  Get token details by token number
- `POST /tokens/call-next/{counterId}`
  Call the next token for a counter
- `PATCH /tokens/{id}/status`
  Update a token status
- `PATCH /tokens/{id}/skip`
  Skip a token

### Feedback
- `POST /feedback`
  Submit feedback for a completed token owned by the authenticated customer

### Reports
- `GET /reports/queue-stats`
  Get queue analytics summary

### Counters
- `GET /counters`
  Get all counters
- `POST /counters`
  Create a counter
- `PATCH /counters/{id}`
  Update a counter
- `DELETE /counters/{id}`
  Delete a counter

### Users
- `GET /users`
  Get all users
- `POST /users`
  Create a user
- `PATCH /users/{id}/role`
  Update a user role
- `DELETE /users/{id}`
  Delete a user

## Frontend Pages
- `/login`
  Login and customer registration page
- `/customer`
  Customer dashboard for token generation, tracking, notifications, and feedback
- `/operator`
  Operator dashboard for queue handling and token lifecycle processing
- `/manager`
  Manager dashboard for queue analytics and bottleneck monitoring
- `/admin`
  Administrator dashboard for user and counter management

## How the System Works
1. A customer signs up or logs in.
2. The customer generates one or more tokens for a selected service.
3. The backend creates either a regular token or a priority token.
4. Waiting tokens are ordered by priority first, then generation time.
5. An operator selects a counter and calls the next eligible token.
6. The token moves through `CALLED`, `IN_SERVICE`, and `COMPLETED`, or can be skipped when allowed.
7. The customer sees queue position, status, counter assignment, and notification updates.
8. After completion, the customer can submit feedback.
9. Managers monitor statistics and counters.
10. Administrators manage users, roles, and counters.

## Project Structure
```text
Java_Project/
|-- backend/
|   |-- src/main/java/com/smartqueue/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- factory/
|   |   |-- model/
|   |   |-- repository/
|   |   |-- service/
|   |   `-- strategy/
|   `-- src/main/resources/application.properties
|-- frontend/
|   |-- src/components/
|   |-- src/context/
|   |-- src/pages/
|   |-- src/services/
|   `-- src/utils/
|-- uml/
|-- FUNCTION_USAGE_GUIDE.txt
`-- README.md
```

## Database Configuration
Current backend configuration uses PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartqueue_db
spring.datasource.username=squser
spring.datasource.password=sq@1234
```

Make sure:
- PostgreSQL is installed
- database `smartqueue_db` exists
- user `squser` exists with the configured password

## Seeded Demo Accounts
These are inserted automatically when the database has no users:
- `admin@sq.com / admin123`
- `op1@sq.com / op123`
- `mgr@sq.com / mgr123`
- `customer@sq.com / cust123`

New customer accounts can also be created from the login page.

## How to Run the Project
### Backend
```powershell
cd backend
./mvnw.cmd spring-boot:run
```

Backend URL:
`http://localhost:8080`

### Frontend
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend URL:
`http://localhost:5173`

## Verification
These commands were verified after the workflow update:

### Backend
```powershell
cd backend
./mvnw.cmd test
```

### Frontend
```powershell
cd frontend
cmd /c npm run build
```

## Design and Architecture Notes
- MVC pattern is used in the backend
- `controller` handles API endpoints
- `service` contains business rules
- `repository` handles persistence
- `model` defines entities
- `dto` is used for request/response payloads
- `factory` creates regular vs priority tokens
- `strategy` applies queue ordering logic

## Current Status
Implemented:
- JWT-secured login and role-based access
- customer self-registration
- customer token ownership protection
- priority-based token generation and ordering
- operator lifecycle handling with counter assignment
- manager monitoring dashboard
- admin user CRUD
- admin counter CRUD
- customer feedback submission
- near real-time dashboard refresh

Not implemented yet:
- manager-side priority rule editing
- real push notifications through WebSocket, email, or SMS
- estimated waiting time prediction

## UML
The repository includes UML resources in the `uml/` folder:
- use case diagram
- class diagram
- activity diagrams
- state diagram

## Suggested Future Improvements
- configurable manager-side priority rules
- real-time push notifications
- estimated waiting time calculation
- audit logs for admin actions
- stronger automated test coverage for token lifecycle rules

## Summary
This project now supports the complete core workflow of a digital queue system:
- customer registration and login
- token generation with priority handling
- secure personal token tracking
- live operator handling across counters
- manager monitoring and queue analytics
- admin user and counter management
- customer feedback after service completion

