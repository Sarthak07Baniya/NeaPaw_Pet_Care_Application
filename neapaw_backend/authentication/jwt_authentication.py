from rest_framework_simplejwt.authentication import JWTAuthentication


class SwaggerFriendlyJWTAuthentication(JWTAuthentication):
    """Accept both "Bearer <token>" and raw token Authorization headers."""

    def get_raw_token(self, header):
        raw_token = super().get_raw_token(header)
        if raw_token is not None:
            return raw_token

        if isinstance(header, bytes):
            parts = header.split()
            if len(parts) == 1:
                return parts[0]

        return None
