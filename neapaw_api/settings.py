
from pathlib import Path
from datetime import timedelta
import os



BASE_DIR = Path(__file__).resolve().parent.parent



SECRET_KEY = 'django-insecure-+o)e*n$f48r&yv=qtmmr84u6fl=aj9@9sm6vw=1ng6oap1k(*h'


DEBUG = True

ALLOWED_HOSTS = ['*']


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
    'profiles',
    'treatment',
]

#Jazzmin Settings

JAZZMIN_SETTINGS = {

    #Site branding
    "site_title": "Neapaw Admin",
    "site_header": "NeaPaw Pet Care",
    "site_brand" : "NeaPaw",
    "site_logo": None, #Can add logo path later
    "login_logo": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome to Neapaw Pet Care Admin Portal",
    "copyright": "Neapaw Pet Care",
    "search_model": ["auth.User", "pets.Pet"],

    #Top menu links
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "API Docs", "url": "/swagger", "new_window":True},
        {"model":"auth.User"},
    ],

    #User menu links
    "usermenu_links":[
        {"model": "auth.user"}
    ],

    # Side Menu
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_app": [],
    "hide_models": [],

    #Custom menu ordering
    "order_with_respect_to": [
        "auth",
        "authentication",
        "profiles",
        "pets",
        "treatment",
    ],

    # Icons for models (using Font Awesome)
    "icons":{
        "auth" : "fas fa-user-cog",
        "auth.user" : "fas fa-user",
        "auth.Group": "fas fa-user",
        "authentication.user" : "fas fa-user-circle",
        "profiles.profile": "fas fa-id-card",
        "pets.pet": "fas fa-paw",
        "treatment.treatment": "fas fa-medkit",

    },

    #UI Tweaks
    "custom_css": None,
    "custome_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    # Change from settings
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user" : "collapsible",
        "auth.group": "vertical_tabs",

    },

    #Related model
    "related_modal_active": False,

    # Custom links

    "custom_links" : {
        "pets" : [{
            "name" : "View All Pets",
            "url" : "admin:pets_pet_changelist",
            "icon": "fas fa-paw",
            "permissions": ["pets.view_pet"]

        }],
    },

    #"show_ui_builder": True, #Customize the admin portal


}

#Jazzmin UI Tweaks

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-primary",
    "accent": "accent-primary",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar" : "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
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


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
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
        'rest_framework_simplejwt.authentication.JWTAuthentication',
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


SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False, # This removes the basic 'Username/Password' login
    'PERSIST_AUTH': True,      # This keeps you logged in even if you refresh the page
}


# Ensure logs directory exists
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)
