"""sync sub-affiliate profit margins from main affiliate

Revision ID: g2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-06-09

"""
from typing import Sequence, Union

from alembic import op

revision: str = "g2b3c4d5e6f7"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE affiliates sub
        SET profit_margin_percent = main.profit_margin_percent,
            updated_at = NOW()
        FROM affiliates main
        WHERE sub.parent_affiliate_id = main.id
          AND sub.affiliate_type = 'sub'
          AND main.affiliate_type = 'main'
        """
    )


def downgrade() -> None:
    pass
