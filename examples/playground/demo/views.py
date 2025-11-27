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
            'label': 'Full Name',
            'placeholder': 'Enter your full name',
            'required': True,
        },
        {
            'type': 'email',
            'name': 'email',
            'label': 'Email Address',
            'placeholder': 'your.email@example.com',
            'required': True,
        },
        {
            'type': 'select',
            'name': 'country',
            'label': 'Country',
            'required': True,
            'placeholder': 'Select a country...',
            'options': [
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
            'label': 'Message',
            'placeholder': 'Type your message here...',
            'required': False,
            'rows': 5,
        },
    ]

    # Compact registration form
    registration_form_fields = [
        {
            'type': 'text',
            'name': 'username',
            'label': 'Username',
            'placeholder': 'Choose a username',
            'required': True,
        },
        {
            'type': 'password',
            'name': 'password',
            'label': 'Password',
            'placeholder': 'Enter a secure password',
            'required': True,
        },
        {
            'type': 'password',
            'name': 'password_confirm',
            'label': 'Confirm Password',
            'placeholder': 'Re-enter your password',
            'required': True,
        },
    ]
    
    # Profile form with various field types
    profile_form_fields = [
        {
            'type': 'text',
            'name': 'name',
            'label': 'Full Name',
            'value': 'John Doe',
            'required': True,
        },
        {
            'type': 'email',
            'name': 'email',
            'label': 'Email',
            'value': 'john@example.com',
            'required': True,
        },
        {
            'type': 'tel',
            'name': 'phone',
            'label': 'Phone Number',
            'placeholder': '+90 555 123 4567',
        },
        {
            'type': 'url',
            'name': 'website',
            'label': 'Website',
            'placeholder': 'https://yourwebsite.com',
        },
        {
            'type': 'number',
            'name': 'age',
            'label': 'Age',
            'min': 18,
            'max': 120,
            'value': 25,
        },
        {
            'type': 'textarea',
            'name': 'bio',
            'label': 'Bio',
            'placeholder': 'Tell us about yourself...',
            'rows': 3,
        },
    ]
    
    # Survey form with radio and checkbox
    survey_form_fields = [
        {
            'type': 'radio',
            'name': 'experience',
            'label': 'How would you rate your experience?',
            'required': True,
            'options': [
                {'value': 'excellent', 'label': 'Excellent'},
                {'value': 'good', 'label': 'Good'},
                {'value': 'average', 'label': 'Average'},
                {'value': 'poor', 'label': 'Poor'},
            ],
        },
        {
            'type': 'checkbox',
            'name': 'newsletter',
            'label': 'Subscribe to newsletter',
            'help_text': 'I want to receive updates and promotions',
        },
        {
            'type': 'select',
            'name': 'frequency',
            'label': 'Preferred contact frequency',
            'placeholder': 'Choose frequency...',
            'options': [
                {'value': 'daily', 'label': 'Daily'},
                {'value': 'weekly', 'label': 'Weekly'},
                {'value': 'monthly', 'label': 'Monthly'},
            ],
        },
        {
            'type': 'textarea',
            'name': 'comments',
            'label': 'Additional Comments',
            'placeholder': 'Any suggestions?',
            'rows': 4,
        },
    ]

    context = {
        'title': 'Form Component',
        'description': 'Complete form container with validation and feedback',
        'contact_form_fields': contact_form_fields,
        'registration_form_fields': registration_form_fields,
        'profile_form_fields': profile_form_fields,
        'survey_form_fields': survey_form_fields,
    }
    return render(request, 'demo/form_demo.html', context)


def forms_advanced(request):
    """
    Demo view for advanced form components (checkbox, radio, switch, datepicker).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing advanced form components
    """
    context = {
        'title': 'Advanced Form Components',
        'description': 'Checkbox, Radio, Switch, and Datepicker components',
    }
    return render(request, 'demo/forms_advanced.html', context)


def table_demo(request):
    """
    Demo view for Table component with search, sorting, and pagination.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing Table component
    """
    import math
    from datetime import datetime, timedelta

    # Generate dummy data (100 records)
    all_records = []
    statuses = ['Active', 'Pending', 'Inactive', 'Completed']
    departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'HR']

    for i in range(1, 101):
        all_records.append({
            'id': i,
            'name': f'User {i:03d}',
            'email': f'user{i:03d}@example.com',
            'department': departments[i % len(departments)],
            'status': statuses[i % len(statuses)],
            'joined': (datetime.now() - timedelta(days=i * 10)).strftime('%Y-%m-%d'),
            'score': 50 + (i * 7) % 51,  # Random score between 50-100
        })

    # Get query parameters
    search_query = request.GET.get('search', '').strip()
    sort_key = request.GET.get('sort', '')
    sort_direction = request.GET.get('direction', 'asc')
    page = int(request.GET.get('page', 1))
    page_size = 10

    # Filter records based on search
    filtered_records = all_records
    if search_query:
        filtered_records = [
            record for record in all_records
            if (search_query.lower() in record['name'].lower() or
                search_query.lower() in record['email'].lower() or
                search_query.lower() in record['department'].lower() or
                search_query.lower() in record['status'].lower())
        ]

    # Sort records
    if sort_key and sort_key in ['id', 'name', 'email', 'department', 'status', 'joined', 'score']:
        reverse = (sort_direction == 'desc')
        filtered_records = sorted(
            filtered_records,
            key=lambda x: x[sort_key],
            reverse=reverse
        )

    # Calculate pagination
    total_records = len(filtered_records)
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1
    page = max(1, min(page, total_pages))  # Ensure page is within range

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_records = filtered_records[start_idx:end_idx]

    # Build pagination data
    def build_page_url(page_num):
        from urllib.parse import urlencode
        params = {}
        if search_query:
            params['search'] = search_query
        if sort_key:
            params['sort'] = sort_key
            params['direction'] = sort_direction
        params['page'] = page_num
        return f'/demo/table/?{urlencode(params)}'

    pagination_data = build_pagination_data(
        page,
        total_pages,
        '/demo/table/?page={page}'
    )

    # Update URLs with search and sort parameters
    for page_info in pagination_data['pages']:
        if not page_info.get('is_ellipsis'):
            page_info['url'] = build_page_url(page_info['number'])

    if pagination_data['prev_url']:
        pagination_data['prev_url'] = build_page_url(page - 1)
    if pagination_data['next_url']:
        pagination_data['next_url'] = build_page_url(page + 1)

    # Define table columns
    columns = [
        {'key': 'id', 'label': 'ID', 'sortable': True},
        {'key': 'name', 'label': 'Name', 'sortable': True},
        {'key': 'email', 'label': 'Email', 'sortable': True},
        {'key': 'department', 'label': 'Department', 'sortable': True},
        {'key': 'status', 'label': 'Status', 'sortable': True},
        {'key': 'joined', 'label': 'Joined', 'sortable': True},
        {'key': 'score', 'label': 'Score', 'sortable': True},
    ]

    # Define row actions
    row_actions = [
        {
            'url_pattern': '/demo/table/view/{id}/',
            'text': 'View',
            'variant': 'secondary',
        },
        {
            'url_pattern': '/demo/table/edit/{id}/',
            'text': 'Edit',
            'variant': 'primary',
        },
    ]

    context = {
        'title': 'Table Component',
        'description': 'Data table with search, sorting, and pagination',
        'columns': columns,
        'rows': paginated_records,
        'row_actions': row_actions,
        'searchable': True,
        'sortable': True,
        'paginated': True,
        'search_query': search_query,
        'sort_key': sort_key,
        'sort_direction': sort_direction,
        'pagination_data': pagination_data,
        'current_page': page,
        'total_pages': total_pages,
        'total_records': total_records,
    }

    return render(request, 'demo/table_demo.html', context)


def components_complex(request):
    """
    Demo view for complex components (Card, Notification, Tabs).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing complex components
    """
    # Tabs data
    tabs_data = [
        {
            'id': 'overview',
            'label': 'Overview',
            'content': '<p>This is the overview panel. Here you can see a summary of your dashboard with key metrics and recent activity.</p>'
        },
        {
            'id': 'details',
            'label': 'Details',
            'content': '<p>Detailed information about your account, settings, and preferences. You can customize various options here.</p>'
        },
        {
            'id': 'settings',
            'label': 'Settings',
            'content': '<p>Configure your application settings, notifications, and privacy options in this panel.</p>'
        },
    ]

    tabs_with_icons = [
        {
            'id': 'home',
            'label': 'Home',
            'icon': 'star',
            'content': '<p>Welcome to your home dashboard. Quick access to all your important features.</p>'
        },
        {
            'id': 'profile',
            'label': 'Profile',
            'icon': 'user',
            'content': '<p>Manage your profile information, avatar, and public settings.</p>'
        },
        {
            'id': 'notifications',
            'label': 'Notifications',
            'icon': 'info',
            'badge': '3',
            'content': '<p>You have 3 new notifications. Review and manage your notification preferences.</p>'
        },
    ]

    context = {
        'title': 'Complex Components',
        'description': 'Card, Notification/Toast, and Tabs components',
        'tabs_data': tabs_data,
        'tabs_with_icons': tabs_with_icons,
    }
    return render(request, 'demo/components_complex.html', context)


def auth_demo(request):
    """
    Demo view for authentication components (Login Form, Register Form).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing auth components
    """
    context = {
        'title': 'Authentication Components',
        'description': 'Login and Register form components with password visibility toggle',
    }
    return render(request, 'demo/auth_demo.html', context)


def dialogs_demo(request):
    """
    Demo view for dialog components (Confirm Dialog, Drawer).

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing dialog components
    """
    context = {
        'title': 'Dialog Components',
        'description': 'Confirm Dialog and Drawer components with focus trap and keyboard support',
    }
    return render(request, 'demo/dialogs_demo.html', context)


def detail_demo(request):
    """
    Demo view for Detail View component.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing Detail View component
    """
    # Sample user profile data
    user_fields = [
        {'label': 'Name', 'value': 'John Doe'},
        {'label': 'Email', 'value': 'john.doe@example.com', 'icon': 'mail'},
        {'label': 'Phone', 'value': '+1 (555) 123-4567', 'icon': 'phone'},
        {'label': 'Department', 'value': 'Engineering'},
        {'label': 'Status', 'value': 'Active', 'badge': True, 'badge_variant': 'success'},
        {'label': 'Role', 'value': 'Senior Developer', 'highlight': True},
        {'label': 'Location', 'value': 'New York, USA', 'icon': 'location'},
        {'label': 'Joined', 'value': 'January 15, 2023'},
    ]
    
    # Sample product data
    product_fields = [
        {'label': 'Product ID', 'value': 'PRD-2024-001'},
        {'label': 'Name', 'value': 'Premium Laptop Pro'},
        {'label': 'Category', 'value': 'Electronics / Computers'},
        {'label': 'Price', 'value': '$1,299.99', 'variant': 'success'},
        {'label': 'Stock', 'value': 'In Stock', 'badge': True, 'badge_variant': 'info'},
        {'label': 'Rating', 'value': '4.5/5.0 (234 reviews)', 'icon': 'star'},
        {'label': 'Manufacturer', 'value': 'TechCorp Inc.'},
        {'label': 'Warranty', 'value': '2 Years', 'highlight': True},
    ]
    
    # Sample order data
    order_fields = [
        {'label': 'Order Number', 'value': '#ORD-2024-5678'},
        {'label': 'Customer', 'value': 'Alice Johnson'},
        {'label': 'Date', 'value': 'November 27, 2024'},
        {'label': 'Total', 'value': '$2,456.78', 'variant': 'info', 'highlight': True},
        {'label': 'Payment', 'value': 'Paid', 'badge': True, 'badge_variant': 'success'},
        {'label': 'Shipping', 'value': 'Delivered', 'badge': True, 'badge_variant': 'success'},
        {'label': 'Tracking', 'value': 'TRK123456789', 'icon': 'package'},
    ]
    
    # Actions for detail views
    user_actions = [
        {'text': 'Edit Profile', 'variant': 'primary', 'href': '#'},
        {'text': 'Send Message', 'variant': 'secondary', 'href': '#'},
    ]
    
    product_actions = [
        {'text': 'Edit', 'variant': 'primary', 'href': '#'},
        {'text': 'Delete', 'variant': 'error', 'href': '#'},
    ]
    
    context = {
        'title': 'Detail View Component',
        'description': 'Label-value grid layout for displaying detailed information',
        'user_fields': user_fields,
        'product_fields': product_fields,
        'order_fields': order_fields,
        'user_actions': user_actions,
        'product_actions': product_actions,
    }
    return render(request, 'demo/detail_demo.html', context)


def upload_demo(request):
    """
    Demo view for File Upload component.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing File Upload component
    """
    context = {
        'title': 'File Upload Component',
        'description': 'Drag & drop file upload with validation and preview',
    }
    return render(request, 'demo/upload_demo.html', context)


def filter_demo(request):
    """
    Demo view for Filter Bar component.

    Args:
        request: Django HTTP request object

    Returns:
        Rendered template showcasing Filter Bar component
    """
    # Sample filters for e-commerce
    ecommerce_filters = [
        {
            'type': 'search',
            'name': 'search',
            'placeholder': 'Search products...',
            'value': request.GET.get('search', ''),
        },
        {
            'type': 'select',
            'name': 'category',
            'placeholder': 'All Categories',
            'value': request.GET.get('category', ''),
            'options': [
                {'value': '', 'label': 'All Categories'},
                {'value': 'electronics', 'label': 'Electronics'},
                {'value': 'clothing', 'label': 'Clothing'},
                {'value': 'books', 'label': 'Books'},
                {'value': 'home', 'label': 'Home & Garden'},
            ],
        },
        {
            'type': 'date_range',
            'name': 'date',
            'value_from': request.GET.get('date_from', ''),
            'value_to': request.GET.get('date_to', ''),
        },
        {
            'type': 'checkbox',
            'name': 'in_stock',
            'label': 'In Stock Only',
            'value': request.GET.get('in_stock', ''),
        },
    ]
    
    # Sample filters for user management
    user_filters = [
        {
            'type': 'text',
            'name': 'name',
            'placeholder': 'Filter by name...',
            'value': request.GET.get('name', ''),
        },
        {
            'type': 'select',
            'name': 'role',
            'placeholder': 'All Roles',
            'value': request.GET.get('role', ''),
            'options': [
                {'value': '', 'label': 'All Roles'},
                {'value': 'admin', 'label': 'Admin'},
                {'value': 'editor', 'label': 'Editor'},
                {'value': 'viewer', 'label': 'Viewer'},
            ],
        },
        {
            'type': 'radio',
            'name': 'status',
            'value': request.GET.get('status', 'all'),
            'options': [
                {'value': 'all', 'label': 'All'},
                {'value': 'active', 'label': 'Active'},
                {'value': 'inactive', 'label': 'Inactive'},
            ],
        },
    ]
    
    # Active filters (for display)
    active_filters = []
    if request.GET.get('search'):
        active_filters.append({'label': 'Search', 'value': request.GET.get('search')})
    if request.GET.get('category'):
        active_filters.append({'label': 'Category', 'value': request.GET.get('category')})
    if request.GET.get('in_stock'):
        active_filters.append({'label': 'Stock', 'value': 'In Stock Only'})
    
    context = {
        'title': 'Filter Bar Component',
        'description': 'Horizontal filter form with various input types',
        'ecommerce_filters': ecommerce_filters,
        'user_filters': user_filters,
        'active_filters': active_filters,
    }
    return render(request, 'demo/filter_demo.html', context)
