
import os
from pathlib import Path
from datetime import timedelta



BASE_DIR = Path(__file__).resolve().parent.parent


def _load_local_env_file():
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env_file()



SECRET_KEY = 'django-insecure-+o)e*n$f48r&yv=qtmmr84u6fl=aj9@9sm6vw=1ng6oap1k(*h'


DEBUG = True

ALLOWED_HOSTS = ["*", "192.168.1.149", "localhost"]


# Application definition

INSTALLED_APPS = [
    'jazzmin', #Must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',

   # Local apps
    'authentication',
    'pets',
    'adoption',
    'shopping',
    'treatment',
    'hostel',
    'profiles',
    'orders',
    
    
]

#Jazzmin Settings

JAZZMIN_SETTINGS = {

    #Site branding
    "site_title": "NeaPaw Control Center",
    "site_header": "NeaPaw Admin Portal",
    "site_brand" : "NeaPaw",
    "site_logo": None, #Can add logo path later
    "login_logo": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome back to the NeaPaw operations dashboard",
    "copyright": "Neapaw Pet Care",
    "search_model": ["authentication.User", "pets.Pet", "shopping.Product", "orders.Order"],

    #Top menu links
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "API Docs", "url": "/swagger", "new_window":True},
        {"name": "Frontend API", "url": "/api/v1/config/", "new_window": True},
        {"model":"authentication.User"},
    ],

    #User menu links
    "usermenu_links":[
        {"model": "authentication.user"}
    ],

    # Side Menu
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_app": [],
    "hide_models": ["auth.Group"],

    #Custom menu ordering
    "order_with_respect_to": [
        "auth",
        "authentication",
        "profiles",
        "pets",
        "adoption",
        "treatment",
        "hostel",
        "shopping",
        "orders",
    ],

    # Icons for models (using Font Awesome)
    "icons":{
        "auth" : "fas fa-user-cog",
        "authentication.user" : "fas fa-user",
        "auth.Group": "fas fa-users",
        "authentication.user" : "fas fa-user-circle",
        "authentication.jwttokenhistory": "fas fa-key",
        "profiles.profile": "fas fa-id-card",
        "pets.pet": "fas fa-paw",
        "shopping.product": "fas fa-box-open",
        "shopping.productimage": "fas fa-image",
        "shopping.offer": "fas fa-tags",
        "shopping.review": "fas fa-star",
        "shopping.cart": "fas fa-shopping-cart",
        "shopping.cartitem": "fas fa-cart-plus",
        "shopping.coupon": "fas fa-ticket-alt",
        "orders.order": "fas fa-shopping-bag",
        "orders.orderitem": "fas fa-receipt",
        "orders.ordertracking": "fas fa-route",
        "orders.chatmessage": "fas fa-comments",
        "pets.petvaccine": "fas fa-syringe",
        "pets.devicepushtoken": "fas fa-bell",
        "treatment.treatmentbooking": "fas fa-stethoscope",
        "treatment.treatmenttype": "fas fa-notes-medical",
        "treatment.treatmentreview": "fas fa-star-half-alt",
        "treatment.treatmentchatmessage": "fas fa-comment-medical",
        "hostel.hostelbooking": "fas fa-home",
        "hostel.hostelreview": "fas fa-hotel",
        "hostel.hostelchatmessage": "fas fa-comments",
        "adoption.adoptionpet": "fas fa-dog",
        "adoption.adoptionapplication": "fas fa-file-signature",
        "adoption.adoptionreview": "fas fa-heart",
        "adoption.adoptionchatmessage": "fas fa-comment-dots",

    },

    #UI Tweaks
    "custom_css": "admin/neapaw_admin.css",
    "custom_js": "admin/neapaw_admin.js",
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    # Change from settings
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "authentication.user" : "collapsible",
        "auth.group": "vertical_tabs",

    },

    #Related model
    "related_modal_active": False,

    # Custom links

    "custom_links" : {
        "pets" : [],
        "shopping": [],
        "orders": [],
    },

    #"show_ui_builder": True, #Customize the admin portal


}

#Jazzmin UI Tweaks

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-navy",
    "accent": "accent-warning",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar" : "sidebar-dark-indigo",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": True,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "default_theme_mode": "light",
    "button_classes" : {
        "primary": "btn-primary",
        "secondary" : "btn-secondary",
        "info": "btn-info",
        "warning": "btn_warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
    
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'neapaw_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'neapaw_api.wsgi.application'


# Database


#DATABASES = {
    #'default': {
       # 'ENGINE': 'django.db.backends.sqlite3',
        #'NAME': BASE_DIR / 'db.sqlite3',
    #}
#}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'neapaw_db',
        'USER': 'postgres',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}



# Password validation


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)


STATIC_URL = 'static/'
AUTH_USER_MODEL = 'authentication.User'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'authentication.jwt_authentication.SwaggerFriendlyJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

CORS_ALLOW_ALL_ORIGINS = True

USE_SMTP_EMAIL = os.environ.get('USE_SMTP_EMAIL', 'False').lower() in {'1', 'true', 'yes', 'on'}

EMAIL_BACKEND = (
    'django.core.mail.backends.smtp.EmailBackend'
    if USE_SMTP_EMAIL
    else 'django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in {'1', 'true', 'yes', 'on'}
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False').lower() in {'1', 'true', 'yes', 'on'}
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'no-reply@neapaw.local')

# eSewa UAT configuration
ESEWA_PRODUCT_CODE = os.environ.get('ESEWA_PRODUCT_CODE', 'EPAYTEST')
ESEWA_SECRET_KEY = os.environ.get('ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q')
ESEWA_BASE_URL = os.environ.get('ESEWA_BASE_URL', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form')
ESEWA_STATUS_URL = os.environ.get('ESEWA_STATUS_URL', 'https://rc.esewa.com.np/api/epay/transaction/status/')
APP_DEEP_LINK_SCHEME = os.environ.get('APP_DEEP_LINK_SCHEME', 'neapaw')


SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Enter either "Bearer <access_token>" or just the raw access token.',
        }
    },
    'USE_SESSION_AUTH': False,
    'PERSIST_AUTH': True,
}


# Ensure logs directory exists
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)
