"""ipmanagement URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView, RedirectView
from rest_framework.routers import SimpleRouter
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

from ipmanagement.views.message import MessageView
from ipmanagement.views.mining import MiningView
from ipmanagement.views.property import PropertyView
from ipmanagement.views.transaction import TransactionView
from ipmanagement.views.views import user, register, redirect_view

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('dashboard/', TemplateView.as_view(template_name='index.html')),
    path('admin/', admin.site.urls),
    path('register', register),
    path('user', user),
    path(r'api-token-auth/', obtain_jwt_token),
    path(r'api-token-refresh/', refresh_jwt_token),
    url(r'login/', RedirectView.as_view(url='/')),
    url(r'^assets/*', redirect_view),
]
router = SimpleRouter(trailing_slash=False)
router.register("api/property", PropertyView, base_name="property")
router.register("api/transaction", TransactionView, base_name="transaction")
router.register("api/message", MessageView, base_name="message")
router.register("api/mine", MiningView, base_name="mining")

urlpatterns += router.urls
