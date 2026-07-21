# HireFlow AI Backend

FastAPI backend scaffold for the HireFlow AI recruitment platform. It includes environment-based configuration, SQLAlchemy session setup, CORS for the Vite frontend, and basic system endpoints. Database models are intentionally not included yet.

## Prerequisites

- Python 3.11 or newer
- PostgreSQL 15 or newer
- The existing HireFlow AI frontend running at `http://localhost:5173`

## Windows setup

Open PowerShell in the project root and enter the backend folder:

```powershell
cd backend
```

Create a virtual environment:

```powershell
py -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this once for the current terminal and try again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Replace `SECRET_KEY` in `.env` with a securely generated value before deploying. Update `DATABASE_URL` if your PostgreSQL credentials differ.

## Install and configure PostgreSQL on Windows

1. Download the Windows installer from the official PostgreSQL website: `https://www.postgresql.org/download/windows/`.
2. Install PostgreSQL Server, pgAdmin, and the command-line tools.
3. Keep port `5432` unless another local service already uses it.
4. Set and securely store the password for the `postgres` administrator.
5. Open SQL Shell (`psql`) or pgAdmin and create the database:

```sql
CREATE DATABASE hireflow_ai;
```

For a cleaner local setup, create a dedicated application account:

```sql
CREATE USER hireflow_app WITH PASSWORD 'choose-a-strong-local-password';
GRANT ALL PRIVILEGES ON DATABASE hireflow_ai TO hireflow_app;
```

Update the private `.env` file with the matching credentials:

```dotenv
DATABASE_URL=postgresql://hireflow_app:choose-a-strong-local-password@localhost:5432/hireflow_ai
```

Never commit `.env` or production credentials to source control.

### Verify database connectivity

With the virtual environment activated, run this from `backend`:

```powershell
python test_database.py
```

The script executes `SELECT 1` and prints `Database connection successful` or `Database connection failed`. It does not create a database, table, or model.
## Run the development server

From the `backend` directory with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

- Root endpoint: `http://127.0.0.1:8000/`
- Health endpoint: `http://127.0.0.1:8000/health` (includes PostgreSQL readiness)
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- Alternative API documentation: `http://127.0.0.1:8000/redoc`

## CORS

The backend permits requests from `http://localhost:5173` by default. A different frontend origin can be configured with a `FRONTEND_URL` value in the local `.env` file.

## Project structure

```text
backend/
├── app/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   └── main.py
├── .env.example
├── README.md
└── requirements.txt
```

## Authentication API

The backend creates only the explicitly registered `users` and `jobs` tables during FastAPI startup. In a later production phase, replace automatic table creation with versioned database migrations.

### Register a user

```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "Ananya Sharma",
  "email": "ananya@example.com",
  "password": "choose-a-strong-password",
  "role": "recruiter"
}
```

Successful registration returns HTTP `201` and safe user fields. Passwords are bcrypt-hashed and never included in responses. Duplicate emails return HTTP `409`.

### Log in

```http
POST /auth/login
Content-Type: application/json

{
  "email": "ananya@example.com",
  "password": "choose-a-strong-password"
}
```

The response contains a signed JWT access token:

```json
{
  "access_token": "<token>",
  "token_type": "bearer"
}
```

### Read the current user

Send the token in the standard authorization header:

```http
GET /auth/me
Authorization: Bearer <token>
```

Access tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES`. Set a strong `SECRET_KEY` in `.env` before using authentication outside local development.
## Jobs API

Every Jobs endpoint requires an `Authorization: Bearer <token>` header. Authenticated administrators and recruiters can create and manage jobs.

- `POST /jobs` creates a job and returns HTTP `201`.
- `GET /jobs` returns paginated jobs sorted newest first.
- `GET /jobs/{job_id}` returns one job or HTTP `404`.
- `PUT /jobs/{job_id}` updates supplied fields.
- `DELETE /jobs/{job_id}` deletes a job and returns HTTP `204`.

List query parameters:

- `page` (default `1`)
- `page_size` (default `20`, maximum `100`)
- `search` for a case-insensitive partial title match
- `department`
- `status` (`Open`, `Closed`, or `Draft`)
- `location`

Example:

```http
GET /jobs?page=1&page_size=20&search=engineer&department=Engineering&status=Open&location=Bengaluru
Authorization: Bearer <token>
```

Salaries are stored as fixed-precision decimals, required skills use PostgreSQL arrays, and the database validates status and salary ranges.
## Production notes

- Use a unique, strong `SECRET_KEY` supplied through the deployment environment.
- Restrict CORS to the deployed frontend origin.
- Run database migrations before starting database-backed routes.
- Run Uvicorn behind a production process manager or managed application platform.
- Tune database pool settings through environment variables for the deployed workload.
