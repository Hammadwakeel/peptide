from pydantic import BaseModel, EmailStr, Field, model_validator


class ReviewApplicationRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|request_more_info)$")
    rejection_reason: str | None = None
    admin_note: str | None = None

    @model_validator(mode="after")
    def validate_action_fields(self) -> "ReviewApplicationRequest":
        if self.action == "reject" and not self.rejection_reason:
            raise ValueError("rejection_reason is required when action is reject")
        if self.action == "request_more_info" and not self.admin_note:
            raise ValueError("admin_note is required when action is request_more_info")
        return self


class ChangePatientPasswordRequest(BaseModel):
    new_password: str | None = Field(None, min_length=8)
    auto_generate: bool = True


class CreateAffiliateRequest(BaseModel):
    email: EmailStr


class UpdateAffiliateProfitMarginRequest(BaseModel):
    profit_margin_percent: float = Field(..., ge=0, le=100)


class UpdateAffiliateSubAffiliateLimitRequest(BaseModel):
    max_sub_affiliates: int | None = Field(
        None,
        ge=0,
        description="Maximum sub-affiliates this main affiliate may invite. Omit or null for unlimited.",
    )
