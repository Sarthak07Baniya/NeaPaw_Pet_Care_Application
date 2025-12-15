from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication

schema_view = get_schema_view(
    openapi.Info(
        title="Neapaw API",
        default_version='v1',
        description="API documentation for Neapaw Pet Care Application",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@nepaw.local"),
        lisence=openapi.License(name="BSD License"),
    ),

    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=(JWTAuthentication,),
)



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/pets/', include('pets.urls')),
    path('api/v1/profiles/', include('profiles.urls')),
    path('api/v1/treatment/', include('treatment.urls')),


    #Swagger Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name = 'schema-redoc'),   
]
