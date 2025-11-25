# Adalex UI - Component Documentation

Complete API reference for all Adalex UI components.

## Table of Contents

### Form Components
- [Label](#label)
- [TextInput](#textinput)
- [Textarea](#textarea)
- [Select](#select)
- [Form](#form)

### UI Components
- [Button](#button)
- [Alert](#alert)
- [Badge](#badge)
- [Spinner](#spinner)

### Advanced Components
- [Tooltip](#tooltip)
- [Modal](#modal)
- [Icon](#icon)
- [Pagination](#pagination)

### Navigation Components
- [Navbar](#navbar)
- [Sidebar](#sidebar)

### Layouts
- [Dashboard Layout](#dashboard-layout)

---

## Form Components

### Label

Semantic form labels with required indicator and help text support.

**Template Path:** `components/label.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `for_id` | string | Yes | - | ID of the associated form input |
| `text` | string | Yes | - | Label text content |
| `required` | boolean | No | `False` | Shows required indicator (*) |
| `help_text` | string | No | - | Additional help text below label |

**Usage:**

```django
{% include "components/label.html" with
  for_id="email"
  text="Email Address"
  required=True
  help_text="We'll never share your email"
%}
```

**Accessibility:**
- Uses semantic `<label>` element
- `for` attribute links to input `id`
- ARIA attributes for required fields

---

### TextInput

Single-line text input with validation states and type variants.

**Template Path:** `components/text_input.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Input name attribute |
| `id` | string | Yes | - | Input ID (must match label `for_id`) |
| `type` | string | No | `"text"` | Input type (`text`, `email`, `password`, `tel`, etc.) |
| `value` | string | No | - | Pre-filled value |
| `placeholder` | string | No | - | Placeholder text |
| `required` | boolean | No | `False` | Mark input as required |
| `disabled` | boolean | No | `False` | Disable input |
| `error` | string | No | - | Error message (triggers error state) |
| `autocomplete` | string | No | - | HTML autocomplete attribute |

**Usage:**

```django
{% include "components/text_input.html" with
  name="email"
  id="email"
  type="email"
  placeholder="you@example.com"
  required=True
%}
```

**States:**
- **Normal:** Default state
- **Focus:** Highlighted border on focus
- **Error:** Red border + error message displayed
- **Disabled:** Grayed out, non-interactive

---

### Textarea

Multi-line text input for longer content.

**Template Path:** `components/textarea.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Textarea name attribute |
| `id` | string | Yes | - | Textarea ID |
| `value` | string | No | - | Pre-filled content |
| `placeholder` | string | No | - | Placeholder text |
| `rows` | integer | No | `3` | Number of visible rows |
| `required` | boolean | No | `False` | Mark as required |
| `disabled` | boolean | No | `False` | Disable textarea |
| `error` | string | No | - | Error message |

**Usage:**

```django
{% include "components/textarea.html" with
  name="message"
  id="message"
  placeholder="Enter your message..."
  rows=5
  required=True
%}
```

---

### Select

Dropdown select menu with custom styling.

**Template Path:** `components/select.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Select name attribute |
| `id` | string | Yes | - | Select ID |
| `options` | list | Yes | - | List of option dicts `[{'value': '', 'label': ''}]` |
| `selected` | string | No | - | Pre-selected value |
| `required` | boolean | No | `False` | Mark as required |
| `disabled` | boolean | No | `False` | Disable select |
| `error` | string | No | - | Error message |

**Usage:**

```django
{% include "components/select.html" with
  name="country"
  id="country"
  options=country_options
  selected="tr"
  required=True
%}
```

**Option Format:**
```python
country_options = [
    {'value': '', 'label': 'Select a country...'},
    {'value': 'tr', 'label': 'Turkey'},
    {'value': 'us', 'label': 'United States'},
]
```

---

### Form

Complete form container with field management, validation, and feedback.

**Template Path:** `components/form.html`

**Template Tag Required:** `{% load a_ui_tags %}`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | Yes | - | Form ID attribute |
| `action` | string | Yes | - | Form action URL |
| `method` | string | No | `"post"` | Form method (`get` or `post`) |
| `title` | string | No | - | Form title displayed at top |
| `fields` | list | Yes | - | List of field configuration dicts (see below) |
| `submit_text` | string | No | `"Submit"` | Submit button text |
| `cancel_url` | string | No | - | Cancel button URL (if provided, shows cancel button) |
| `csrf_token` | boolean | No | `False` | Include Django CSRF token |

**Field Configuration:**

Each field in the `fields` list should be a dictionary with the following structure:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Field type: `text`, `email`, `password`, `textarea`, `select` |
| `name` | string | Yes | Field name attribute |
| `id` | string | Yes | Field ID attribute |
| `label` | string | Yes | Field label text |
| `value` | string | No | Default/pre-filled value |
| `placeholder` | string | No | Placeholder text |
| `required` | boolean | No | Mark field as required |
| `disabled` | boolean | No | Disable field |
| `error` | string | No | Error message to display |
| `options` | list | Conditional | Required for `select` type: list of `{'value': '', 'label': ''}` dicts |

**Usage:**

```python
# In views.py
def contact_form(request):
    if request.method == 'POST':
        # Process form data
        name = request.POST.get('name')
        email = request.POST.get('email')
        # ... handle submission
        return redirect('success')

    # Define form fields
    form_fields = [
        {
            'type': 'text',
            'name': 'name',
            'id': 'name',
            'label': 'Full Name',
            'placeholder': 'Enter your name',
            'required': True,
        },
        {
            'type': 'email',
            'name': 'email',
            'id': 'email',
            'label': 'Email Address',
            'placeholder': 'your@email.com',
            'required': True,
        },
        {
            'type': 'select',
            'name': 'country',
            'id': 'country',
            'label': 'Country',
            'required': True,
            'options': [
                {'value': '', 'label': 'Select...'},
                {'value': 'tr', 'label': 'Turkey'},
                {'value': 'us', 'label': 'United States'},
            ],
        },
        {
            'type': 'textarea',
            'name': 'message',
            'id': 'message',
            'label': 'Message',
            'placeholder': 'Your message...',
            'required': False,
        },
    ]

    return render(request, 'contact.html', {
        'form_fields': form_fields
    })
```

```django
{# In template #}
{% load a_ui_tags %}

{% include "components/form.html" with
  id="contact-form"
  action="{% url 'contact_submit' %}"
  method="post"
  title="Contact Us"
  fields=form_fields
  submit_text="Send Message"
  cancel_url="{% url 'home' %}"
  csrf_token=True
%}
```

**Form Variants:**

The form component supports CSS modifier classes for different styles:

- **Compact:** `.a-form--compact` - Reduced spacing for smaller forms
- **Inline:** `.a-form--inline` - Horizontal layout for simple forms
- **Borderless:** `.a-form--borderless` - No border or shadow

**JavaScript Required:** `form.js`

**Features:**

- **Client-side validation** - HTML5 validation with custom error messages
- **Real-time feedback** - Field validation on blur
- **HTMX integration** - Automatic feedback after HTMX form submission
- **Accessibility** - Full ARIA support, keyboard navigation
- **Feedback messages** - Success/error/warning message display
- **Auto-reset option** - Optional form reset after successful submission

**Accessibility:**

- Uses semantic `<form>` element with `role="form"`
- Form title linked via `aria-labelledby`
- Field errors announced with `role="alert"`
- All fields properly associated with labels
- Validation feedback with `aria-invalid` and `aria-describedby`
- Live region for form feedback (`aria-live="polite"`)

**JavaScript API:**

```javascript
// Initialize forms manually
window.AdalexUI.Form.init();

// Validate entire form
const isValid = window.AdalexUI.Form.validate(formElement);

// Validate single field
const fieldValid = window.AdalexUI.Form.validateField(inputElement);

// Show feedback message
window.AdalexUI.Form.showFeedback(
  formElement,
  'Success message',
  'success',  // type: success, error, warning, info
  5000        // duration in ms (0 = no auto-hide)
);

// Hide feedback
window.AdalexUI.Form.hideFeedback(formElement);

// Reset form
window.AdalexUI.Form.reset(formElement);

// Get form data as object
const data = window.AdalexUI.Form.getData(formElement);
// Returns: { name: 'value', email: 'user@example.com', ... }
```

**Events:**

The form component dispatches custom events:

```javascript
// Form reset event
formElement.addEventListener('form:reset', (e) => {
  console.log('Form was reset', e.detail.form);
});

// HTMX events (automatic)
formElement.addEventListener('htmx:afterRequest', (e) => {
  // Automatically shows success/error feedback
});
```

**Best Practices:**

1. **Always include CSRF token** for POST forms: `csrf_token=True`
2. **Provide clear labels** - Use descriptive label text
3. **Mark required fields** - Set `required: True` in field config
4. **Handle errors properly** - Display field-level errors from backend validation
5. **Use appropriate field types** - `email`, `password`, `tel` for better mobile UX
6. **Test validation** - Ensure both client and server-side validation
7. **Provide cancel option** - Include `cancel_url` for multi-step forms

**Server-side Error Handling:**

To display server-side validation errors, pass error messages in field configs:

```python
def contact_form(request):
    errors = {}

    if request.method == 'POST':
        # Validate data
        if not request.POST.get('email'):
            errors['email'] = 'Email is required'
        elif '@' not in request.POST.get('email'):
            errors['email'] = 'Please enter a valid email address'

    # Add errors to field configs
    form_fields = [
        {
            'type': 'email',
            'name': 'email',
            'id': 'email',
            'label': 'Email',
            'value': request.POST.get('email', ''),
            'error': errors.get('email'),  # Add error message
            'required': True,
        },
    ]

    return render(request, 'contact.html', {'form_fields': form_fields})
```

---

## UI Components

### Button

Versatile button component with multiple variants, sizes, and states.

**Template Path:** `components/button.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Button text content |
| `type` | string | No | `"button"` | Button type (`button`, `submit`, `reset`) |
| `variant` | string | No | `"primary"` | Style variant (`primary`, `secondary`, `ghost`, `link`) |
| `size` | string | No | `"md"` | Button size (`sm`, `md`, `lg`) |
| `disabled` | boolean | No | `False` | Disable button |
| `icon` | string (HTML) | No | - | Optional SVG icon HTML |

**Usage:**

```django
{% include "components/button.html" with
  text="Save Changes"
  type="submit"
  variant="primary"
  size="lg"
%}
```

**Variants:**
- `primary` - Filled background, main action
- `secondary` - Outlined, secondary action
- `ghost` - Transparent, tertiary action
- `link` - Text only, minimal styling

---

### Alert

Contextual alert messages with dismissible functionality.

**Template Path:** `components/alert.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | Alert message text |
| `type` | string | No | `"info"` | Alert type (`info`, `success`, `warning`, `error`) |
| `dismissible` | boolean | No | `False` | Show close button |
| `id` | string | Conditional | - | Required if `dismissible=True` |

**Usage:**

```django
{% include "components/alert.html" with
  message="Your changes have been saved!"
  type="success"
  dismissible=True
  id="alert-success"
%}
```

**JavaScript Required:** `alert.js` for dismissible functionality

---

### Badge

Small status indicators and labels.

**Template Path:** `components/badge.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Badge text content |
| `variant` | string | No | `"neutral"` | Color variant |
| `size` | string | No | `"md"` | Badge size (`sm`, `md`) |

**Variants:**
- `neutral` - Gray
- `primary` - Primary color
- `secondary` - Secondary color
- `success` - Green
- `warning` - Yellow/Orange
- `error` - Red

**Usage:**

```django
{% include "components/badge.html" with
  text="Active"
  variant="success"
  size="sm"
%}
```

---

### Spinner

Loading spinner with CSS animation.

**Template Path:** `components/spinner.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `size` | string | No | `"md"` | Spinner size (`sm`, `md`, `lg`) |
| `label` | string | No | - | Accessible label for screen readers |

**Usage:**

```django
{% include "components/spinner.html" with
  size="lg"
  label="Loading data..."
%}
```

**No JavaScript required** - Pure CSS animation.

---

## Advanced Components

### Tooltip

Contextual tooltips on hover/focus.

**Template Path:** `components/tooltip.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Tooltip content text |
| `position` | string | No | `"top"` | Tooltip position (`top`, `bottom`, `left`, `right`) |
| `trigger_content` | string (HTML) | Yes | - | HTML content that triggers tooltip |

**Usage:**

```django
{% include "components/tooltip.html" with
  text="Additional help information"
  position="top"
  trigger_content='<button class="a-button a-button--sm">Help</button>'
%}
```

**JavaScript Required:** `tooltip.js`

---

### Modal

Accessible modal dialogs with focus trap.

**Template Path:** `components/modal.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | Yes | - | Unique modal ID |
| `title` | string | Yes | - | Modal title |
| `content` | string (HTML) | Yes | - | Modal body content (HTML) |
| `size` | string | No | `"md"` | Modal size (`sm`, `md`, `lg`) |
| `footer` | string (HTML) | No | - | Optional footer content (buttons) |

**Usage:**

```django
{# Modal trigger button #}
<button data-modal-open="confirm-modal">Open Modal</button>

{# Modal component #}
{% include "components/modal.html" with
  id="confirm-modal"
  title="Confirm Action"
  size="md"
  content="<p>Are you sure?</p>"
  footer='<button data-modal-close>Cancel</button>'
%}
```

**JavaScript Required:** `modal.js`

**Features:**
- ESC key to close
- Backdrop click to close
- Focus trap
- ARIA attributes

---

### Icon

SVG icon library with size and color support.

**Template Path:** `components/icon.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Icon name (see available icons below) |
| `size` | string | No | `"md"` | Icon size (`sm`, `md`, `lg`) |
| `color` | string | No | `currentColor` | Icon color (CSS color value) |

**Available Icons:**
- `check` - Checkmark
- `close` - X/Close
- `chevron-right` - Right arrow
- `chevron-left` - Left arrow
- `info` - Information circle
- `warning` - Warning triangle
- `error` - Error X circle
- `star` - Star
- `heart` - Heart
- `settings` - Gear/cog
- `search` - Magnifying glass
- `user` - User profile

**Usage:**

```django
{% include "components/icon.html" with
  name="check"
  size="lg"
  color="var(--secondary-main)"
%}
```

---

### Pagination

Page navigation for paginated content.

**Template Path:** `components/pagination.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pages` | list | Yes | - | Page data from `build_pagination_data()` |
| `prev_url` | string | No | - | Previous page URL |
| `next_url` | string | No | - | Next page URL |

**Usage:**

```python
# In views.py
from adalex_ui.utils import build_pagination_data

def my_view(request):
    current_page = int(request.GET.get('page', 1))
    total_pages = 10
    pagination = build_pagination_data(
        current_page,
        total_pages,
        "/items/?page={page}"
    )

    return render(request, 'template.html', {
        'pagination': pagination
    })
```

```django
{# In template #}
{% include "components/pagination.html" with
  pages=pagination.pages
  prev_url=pagination.prev_url
  next_url=pagination.next_url
%}
```

---

## Navigation Components

### Navbar

Responsive navigation bar with mobile menu and user dropdown.

**Template Path:** `components/navbar.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `logo_text` | string | Yes | - | Brand/logo text |
| `logo_url` | string | No | - | Optional logo image URL |
| `nav_items` | list | Yes | - | Navigation links (see format below) |
| `user_menu` | list | No | - | User dropdown items (see format below) |
| `user_name` | string | No | - | Displayed user name |

**Nav Items Format:**
```python
nav_items = [
    {'url': '/dashboard/', 'text': 'Dashboard', 'active': True},
    {'url': '/products/', 'text': 'Products', 'active': False},
]
```

**User Menu Format:**
```python
user_menu = [
    {'url': '/profile/', 'text': 'Profile'},
    {'url': '/settings/', 'text': 'Settings'},
    {'url': '/logout/', 'text': 'Logout'},
]
```

**Usage:**

```django
{% include "components/navbar.html" with
  logo_text="My App"
  nav_items=nav_items
  user_menu=user_menu
  user_name="John Doe"
%}
```

**JavaScript Required:** `navbar.js`

**Features:**
- Sticky positioning (managed by layout)
- Mobile hamburger menu
- User dropdown
- Keyboard accessible

---

### Sidebar

Collapsible sidebar navigation with icons.

**Template Path:** `components/sidebar.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `items` | list | Yes | - | Sidebar navigation items (see format below) |
| `collapsible` | boolean | No | `False` | Enable collapse/expand button |
| `collapsed` | boolean | No | `False` | Initial collapsed state |

**Items Format:**
```python
sidebar_items = [
    {'url': '/dashboard/', 'text': 'Dashboard', 'icon': 'star', 'active': True},
    {'url': '/products/', 'text': 'Products', 'icon': 'search', 'active': False},
]
```

**Usage:**

```django
{% include "components/sidebar.html" with
  items=sidebar_items
  collapsible=True
%}
```

**JavaScript Required:** `sidebar.js`

---

## Layouts

### Dashboard Layout

Complete dashboard layout with navbar, sidebar, and content area.

**Template Path:** `layouts/dashboard.html`

**Context Variables:**

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `site_name` | string | No | Site/brand name (default: "Adalex UI") |
| `nav_items` | list | No | Navbar navigation items |
| `user_menu` | list | No | User dropdown menu items |
| `user_name` | string | No | Current user display name |
| `sidebar_items` | list | No | Sidebar navigation items |
| `page_title` | string | No | Page header title |
| `page_description` | string | No | Page header description |

**Usage:**

```python
# In views.py
def dashboard_view(request):
    context = {
        'site_name': 'My App',
        'page_title': 'Dashboard',
        'page_description': 'Welcome to your dashboard',
        'nav_items': [...],
        'user_menu': [...],
        'user_name': 'John Doe',
        'sidebar_items': [...],
    }
    return render(request, 'my_dashboard.html', context)
```

```django
{# In my_dashboard.html #}
{% extends "layouts/dashboard.html" %}

{% block content %}
  <p>Your dashboard content here!</p>
{% endblock %}
```

**Blocks Available:**

- `{% block title %}` - Page title (appended to site_name)
- `{% block navbar %}` - Override entire navbar
- `{% block sidebar %}` - Override entire sidebar
- `{% block page_header %}` - Override page header
- `{% block content %}` - Main content area
- `{% block extra_css %}` - Additional CSS
- `{% block extra_js %}` - Additional JavaScript

**Layout Structure:**
- Uses CSS Grid
- Navbar: Fixed height (64px)
- Sidebar: Collapsible, 256px → 64px
- Main content: Scrollable, full remaining space
- Responsive: Mobile-first design

---

## JavaScript Components

Components requiring JavaScript are automatically initialized on page load and after HTMX swaps.

**Required Scripts:**

```django
{# Individual components #}
<script src="{% static 'a-ui/js/components/alert.js' %}"></script>
<script src="{% static 'a-ui/js/components/form.js' %}"></script>
<script src="{% static 'a-ui/js/components/modal.js' %}"></script>
<script src="{% static 'a-ui/js/components/tooltip.js' %}"></script>
<script src="{% static 'a-ui/js/components/navbar.js' %}"></script>
<script src="{% static 'a-ui/js/components/sidebar.js' %}"></script>

{# Main initialization #}
<script src="{% static 'a-ui/js/main.js' %}"></script>
```

**Note:** The Dashboard layout automatically includes all required scripts.

---

## Design Tokens

All components use CSS variables from `_tokens.scss`:

**Colors:**
- `--primary-*`, `--secondary-*`, `--neutral-*`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-light`, `--border-main`, `--border-dark`

**Spacing:**
- `--spacing-xs` through `--spacing-3xl`

**Typography:**
- `--font-size-xs` through `--font-size-4xl`
- `--font-weight-normal` through `--font-weight-bold`

**Layout:**
- `--navbar-height` (64px)
- `--sidebar-width` (256px)
- `--sidebar-collapsed-width` (64px)

**Shadows, Radius, Transitions:** See `_tokens.scss` for complete list.

---

## Best Practices

1. **Always pair Label with inputs** using matching `for_id` and `id`
2. **Use semantic HTML** - forms, buttons, nav elements
3. **Provide error messages** for validation feedback
4. **Include ARIA attributes** for accessibility
5. **Test keyboard navigation** on all interactive components
6. **Use design tokens** instead of hard-coded values
7. **Keep components isolated** - no global style dependencies

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See main project LICENSE file.
