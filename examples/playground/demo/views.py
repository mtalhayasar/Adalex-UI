"""Views for demo app"""

from django.shortcuts import render, redirect
from django.contrib import messages
from adalex_ui.utils import build_pagination_data


def index(request):
    """
    Homepage view showing available component demos.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template with component showcase
    """
    context = {
        'title': 'Adalex UI Component Library',
        'description': 'Interactive playground for Adalex UI components',
    }
    return render(request, 'demo/index.html', context)


def forms_basic(request):
    """
    Demo view for basic form components (label, text input, textarea, select).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing form components
    """
    context = {
        'title': 'Basic Form Components',
        'description': 'Label, TextInput, Textarea, and Select components',
        'country_options': [
            {'value': '', 'label': 'Select a country...'},
            {'value': 'tr', 'label': 'Turkey'},
            {'value': 'us', 'label': 'United States'},
            {'value': 'uk', 'label': 'United Kingdom'},
            {'value': 'de', 'label': 'Germany'},
            {'value': 'fr', 'label': 'France'},
        ],
    }
    return render(request, 'demo/forms_basic.html', context)


def components_ui(request):
    """
    Demo view for UI components (button, alert, badge, spinner).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing UI components
    """
    context = {
        'title': 'UI Components',
        'description': 'Button, Alert, Badge, and Spinner components',
    }
    return render(request, 'demo/components_ui.html', context)


def components_advanced(request):
    """
    Demo view for advanced components (tooltip, modal, icon, pagination).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing advanced components
    """
    # Pagination examples
    pagination_1 = build_pagination_data(1, 10, "/demo/?page={page}")
    pagination_5 = build_pagination_data(5, 10, "/demo/?page={page}")
    pagination_10 = build_pagination_data(10, 10, "/demo/?page={page}")
    pagination_2_of_3 = build_pagination_data(2, 3, "/demo/?page={page}")

    context = {
        'title': 'Advanced Components',
        'description': 'Tooltip, Modal, Icon, and Pagination components',
        'pagination_1': pagination_1,
        'pagination_5': pagination_5,
        'pagination_10': pagination_10,
        'pagination_2_of_3': pagination_2_of_3,
    }
    return render(request, 'demo/components_advanced.html', context)


def navigation_demo(request):
    """
    Demo view for navigation components (navbar, sidebar, dashboard layout).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing navigation components
    """
    # Navbar data
    nav_items = [
        {'url': '#dashboard', 'text': 'Dashboard', 'active': True},
        {'url': '#products', 'text': 'Products', 'active': False},
        {'url': '#orders', 'text': 'Orders', 'active': False},
        {'url': '#customers', 'text': 'Customers', 'active': False},
    ]

    user_menu = [
        {'url': '#profile', 'text': 'Profile'},
        {'url': '#settings', 'text': 'Settings'},
        {'url': '#logout', 'text': 'Logout'},
    ]

    # Sidebar data
    sidebar_items = [
        {'url': '#dashboard', 'text': 'Dashboard', 'icon': 'star', 'active': True},
        {'url': '#products', 'text': 'Products', 'icon': 'search', 'active': False},
        {'url': '#orders', 'text': 'Orders', 'icon': 'check', 'active': False},
        {'url': '#customers', 'text': 'Customers', 'icon': 'user', 'active': False},
        {'url': '#analytics', 'text': 'Analytics', 'icon': 'info', 'active': False},
        {'url': '#settings', 'text': 'Settings', 'icon': 'settings', 'active': False},
    ]

    context = {
        'title': 'Navigation Components',
        'description': 'Navbar, Sidebar, and Dashboard Layout components',
        'page_title': 'Navigation Components',
        'page_description': 'Interactive demo of Navbar, Sidebar, and Dashboard Layout',
        'nav_items': nav_items,
        'user_menu': user_menu,
        'user_name': 'John Doe',
        'sidebar_items': sidebar_items,
        'site_name': 'Adalex UI Demo',
    }
    return render(request, 'demo/navigation_demo.html', context)


def form_demo(request):
    """
    Demo view for Form component with full form submission handling.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing Form component
    """
    # Handle form submission
    if request.method == 'POST':
        # Simulate form processing
        name = request.POST.get('full_name', '')
        email = request.POST.get('email', '')
        country = request.POST.get('country', '')
        message = request.POST.get('message', '')

        # In a real application, you would process the data here
        # For demo purposes, we'll just show a success message
        messages.success(
            request,
            f'Form submitted successfully! Welcome, {name}!'
        )

        # Redirect to prevent form resubmission
        return redirect('form_demo')

    # Prepare form fields configuration
    contact_form_fields = [
        {
            'type': 'text',
            'name': 'full_name',
            'id': 'full_name',
            'label': 'Full Name',
            'placeholder': 'Enter your full name',
            'required': True,
        },
        {
            'type': 'email',
            'name': 'email',
            'id': 'email',
            'label': 'Email Address',
            'placeholder': 'your.email@example.com',
            'required': True,
        },
        {
            'type': 'select',
            'name': 'country',
            'id': 'country',
            'label': 'Country',
            'required': True,
            'options': [
                {'value': '', 'label': 'Select a country...'},
                {'value': 'tr', 'label': 'Turkey'},
                {'value': 'us', 'label': 'United States'},
                {'value': 'uk', 'label': 'United Kingdom'},
                {'value': 'de', 'label': 'Germany'},
                {'value': 'fr', 'label': 'France'},
            ],
        },
        {
            'type': 'textarea',
            'name': 'message',
            'id': 'message',
            'label': 'Message',
            'placeholder': 'Type your message here...',
            'required': False,
        },
    ]

    # Compact registration form
    registration_form_fields = [
        {
            'type': 'text',
            'name': 'username',
            'id': 'username',
            'label': 'Username',
            'placeholder': 'Choose a username',
            'required': True,
        },
        {
            'type': 'password',
            'name': 'password',
            'id': 'password',
            'label': 'Password',
            'placeholder': 'Enter a secure password',
            'required': True,
        },
        {
            'type': 'password',
            'name': 'password_confirm',
            'id': 'password_confirm',
            'label': 'Confirm Password',
            'placeholder': 'Re-enter your password',
            'required': True,
        },
    ]

    context = {
        'title': 'Form Component',
        'description': 'Complete form container with validation and feedback',
        'contact_form_fields': contact_form_fields,
        'registration_form_fields': registration_form_fields,
    }
    return render(request, 'demo/form_demo.html', context)
