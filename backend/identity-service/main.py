from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from config import PORT
from middleware.auth import bearer_scheme
from routes import api_router

app = FastAPI(
    title="Frontier Nexus Rx — Identity Service",
    description=(
        "Auth / RBAC API. To test protected endpoints in Swagger:\n\n"
        "1. Call **POST /auth/login** with role + email + password\n"
        "2. Copy the `token` from the response\n"
        "3. Click **Authorize** (top right) and paste the token\n"
        "4. All protected endpoints will send `Authorization: Bearer <token>` automatically"
    ),
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema.setdefault("components", {}).setdefault("securitySchemes", {})["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT access token from POST /auth/login",
    }
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
