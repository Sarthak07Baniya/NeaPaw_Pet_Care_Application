from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import JWTTokenHistory
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer
    @swagger_auto_schema(
        request_body=LoginSerializer,
        responses={200: UserSerializer}
    )

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if user:
            refresh = RefreshToken.for_user(user)
            JWTTokenHistory.record_tokens(
                user=user,
                refresh_token=refresh,
                access_token=refresh.access_token,
                source="login",
            )
            return Response({
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            })
        return Response(
            {"error": "Username or password is incorrect"},
            status=status.HTTP_401_UNAUTHORIZED
        )

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    @swagger_auto_schema(
        request_body=PasswordResetRequestSerializer,
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        otp = user.issue_password_reset_otp()

        send_mail(
            subject="NeaPaw Password Reset OTP",
            message=(
                f"Your NeaPaw password reset OTP is {otp}. "
                "It is valid for 10 minutes."
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({
            "message": "A 6-digit OTP has been sent to your email address.",
            "email": email
        }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    @swagger_auto_schema(
        request_body=PasswordResetConfirmSerializer,
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)

            if not user.password_reset_otp or not user.password_reset_otp_expires_at:
                return Response({
                    "error": "No active OTP found for this email. Please request a new OTP."
                }, status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() > user.password_reset_otp_expires_at:
                user.clear_password_reset_otp()
                return Response({
                    "error": "OTP has expired. Please request a new OTP."
                }, status=status.HTTP_400_BAD_REQUEST)

            if user.password_reset_otp != otp:
                return Response({
                    "error": "Invalid OTP."
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save(update_fields=['password'])
            user.clear_password_reset_otp()
            
            return Response({
                "message": "Password has been reset successfully. You can now login with your new password."
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    @swagger_auto_schema(
        request_body=ChangePasswordSerializer,
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )

