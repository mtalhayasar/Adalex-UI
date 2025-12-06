# Adalex UI - Component Documentation

Complete API reference for all Adalex UI components.

## Installation
1. **Install the package:**
   ```bash
   pip install adalex-ui
   ```
   or
   ```bash
   pip install git+https://github.com/mtalhayasar/adalex-ui.git
   ```
2. **Add to `INSTALLED_APPS` in `settings.py`:**
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'adalex_ui',
   ]
   ```

3. **Include static files in your templates:**
   ```html
   {% load static %}
   <link rel="stylesheet" href="{% static 'a-ui/css/main.css' %}">
   <script src="{% static 'a-ui/js/main.js' %}" defer></script>
   ```

4. **Use components in templates:**
   ```html
   {% load a_ui_tags %}
   {% include 'components/button.html' with label="Click me" variant="primary" %}
   ```

## Table of Contents

### Form Components
- [Label](#label)
- [TextInput](#textinput)
- [Textarea](#textarea)
- [Select](#select)
- [Form](#form)

### Authentication Components
- [Login Form](#login-form)
- [Register Form](#register-form)

### UI Components
- [Button](#button)
- [Alert](#alert)
- [Badge](#badge)
- [Spinner](#spinner)
- [Card](#card)
- [Notification](#notification)
- [Tabs](#tabs)

### Loading Components
- [Loading Bar](#loading-bar)
- [Skeleton](#skeleton)
- [Loading Manager](#loading-manager)

### Advanced Components
- [Tooltip](#tooltip)
- [Modal](#modal)
- [Confirm Dialog](#confirm-dialog)
- [Drawer](#drawer)
- [Icon](#icon)
- [Pagination](#pagination)

### Navigation Components
- [Navbar](#navbar)
- [Sidebar](#sidebar)

### Data Components
- [Table](#table)
- [Detail View](#detail-view)
- [Filter Bar](#filter-bar)

### File Components
- [File Upload](#file-upload)

### Layouts
- [Dashboard Layout](#dashboard-layout)

### Accessibility
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Focus Management](#focus-management)
- [ARIA Attributes](#aria-attributes)
- [WCAG 2.1 Compliance](#wcag-21-compliance)

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

**Field Configuration:**

Each field in the `fields` list should be a dictionary with the following structure:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `type` | string | Yes | Field type: `text`, `email`, `password`, `tel`, `url`, `number`, `textarea`, `select`, `checkbox`, `radio` |
| `name` | string | Yes | Field name attribute |
| `label` | string | Yes | Field label text |
| `value` | string/boolean | No | Default/pre-filled value |
| `placeholder` | string | No | Placeholder text (for text/textarea/select) |
| `required` | boolean | No | Mark field as required |
| `error` | string | No | Error message to display |
| `help_text` | string | No | Help text below field (or checkbox label for checkbox type) |
| `options` | list | Conditional | Required for `select` and `radio`: list of `{'value': '', 'label': ''}` dicts |
| `rows` | integer | No | Number of rows for textarea (default: 4) |
| `min` | number | No | Minimum value for number input |
| `max` | number | No | Maximum value for number input |

**Usage:**

```python
# In views.py
def contact_form(request):
    if request.method == 'POST':
        # Process form data
        name = request.POST.get('name')
        email = request.POST.get('email')
        # ... handle submission
        messages.success(request, 'Form submitted successfully!')
        return redirect('contact')

    # Define form fields
    form_fields = [
        {
            'type': 'text',
            'name': 'name',
            'label': 'Full Name',
            'placeholder': 'Enter your name',
            'required': True,
        },
        {
            'type': 'email',
            'name': 'email',
            'label': 'Email Address',
            'placeholder': 'your@email.com',
            'required': True,
        },
        {
            'type': 'tel',
            'name': 'phone',
            'label': 'Phone Number',
            'placeholder': '+90 555 123 4567',
        },
        {
            'type': 'select',
            'name': 'country',
            'label': 'Country',
            'placeholder': 'Select a country...',
            'required': True,
            'options': [
                {'value': 'tr', 'label': 'Turkey'},
                {'value': 'us', 'label': 'United States'},
                {'value': 'uk', 'label': 'United Kingdom'},
            ],
        },
        {
            'type': 'radio',
            'name': 'contact_method',
            'label': 'Preferred Contact Method',
            'required': True,
            'options': [
                {'value': 'email', 'label': 'Email'},
                {'value': 'phone', 'label': 'Phone'},
                {'value': 'both', 'label': 'Both'},
            ],
        },
        {
            'type': 'checkbox',
            'name': 'newsletter',
            'label': 'Newsletter',
            'help_text': 'I want to receive updates and promotions',
        },
        {
            'type': 'textarea',
            'name': 'message',
            'label': 'Message',
            'placeholder': 'Your message...',
            'rows': 5,
            'required': True,
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
  action=""
  method="POST"
  title="Contact Us"
  fields=form_fields
  submit_text="Send Message"
  cancel_url="{% url 'home' %}"
%}
```

**JavaScript Features:**

The Form component includes automatic client-side validation:

- **Email validation** - Checks for valid email format
- **Phone validation** - Validates phone number format
- **URL validation** - Ensures valid URL format
- **Number validation** - Respects min/max attributes
- **Required field validation** - Checks for empty required fields
- **Real-time validation** - Validates on blur, clears errors on input
- **HTMX integration** - Shows success/error messages after async submission

```javascript
// Initialize forms (automatically called on page load)
AdalexUI.Form.init();

// Manual validation
const form = document.getElementById('contact-form');
const isValid = AdalexUI.Form.validate(form);

// Show feedback message
AdalexUI.Form.showFeedback(form, 'Success!', 'success');

// Clear all errors
AdalexUI.Form.clearAllErrors(form);
```

**HTMX Integration:**

```django
{# Form with HTMX #}
<form class="a-form" 
      id="ajax-form"
      hx-post="{% url 'form_submit' %}"
      hx-target="#result"
      data-reset-on-success="true">
  <!-- Form automatically validates before HTMX request -->
  <!-- Shows feedback message after success/error -->
</form>
```

**Accessibility:**

- All form fields have associated labels with `for` attributes
- Required fields include `aria-required="true"`
- Error states include `aria-invalid="true"` and `aria-describedby`
- Error messages have `role="alert"` for screen reader announcements
- Radio groups use `role="radiogroup"`
- Keyboard navigation fully supported
- Focus management on validation errors

**Best Practices:**

1. **Always include labels** - Every field must have a label for accessibility
2. **Use appropriate input types** - `email`, `tel`, `url` for better mobile keyboards
3. **Add placeholders sparingly** - Don't use placeholders as labels
4. **Group related fields** - Use fieldsets for logical grouping
5. **Provide clear error messages** - Be specific about what needs correction
6. **Include help text** - Guide users for complex fields
7. **Test with keyboard** - Ensure all fields are keyboard accessible

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

## Authentication Components

### Login Form

Complete login form with email and password fields, password visibility toggle, and optional links.

**Template Path:** `components/login_form.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | string | No | `""` | Form action URL |
| `title` | string | No | - | Form title |
| `subtitle` | string | No | - | Subtitle text below title |
| `show_remember` | boolean | No | `False` | Show "Remember me" checkbox |
| `show_forgot_password` | boolean | No | `False` | Show "Forgot password?" link |
| `show_register_link` | boolean | No | `False` | Show "Create an account" link |
| `forgot_password_url` | string | No | `"#"` | URL for forgot password link |
| `register_url` | string | No | `"#"` | URL for register link |
| `email_error` | string | No | - | Error message for email field |
| `password_error` | string | No | - | Error message for password field |
| `error_message` | string | No | - | General error alert message |

**Usage:**

```django
{% include "components/login_form.html" with
  title="Welcome Back"
  subtitle="Sign in to your account"
  action="{% url 'login' %}"
  show_remember=True
  show_forgot_password=True
  show_register_link=True
  register_url="{% url 'register' %}"
  forgot_password_url="{% url 'password_reset' %}"
%}
```

**With Validation Errors:**

```django
{% include "components/login_form.html" with
  title="Sign In"
  action="{% url 'login' %}"
  email_error="Please enter a valid email"
  password_error="Password is required"
  error_message="Invalid email or password"
%}
```

**JavaScript Features:**

The login form includes password visibility toggle:

```javascript
// Toggle password visibility
window.AdalexUI.Auth.togglePassword('login-password');

// Show password
window.AdalexUI.Auth.showPassword('login-password');

// Hide password
window.AdalexUI.Auth.hidePassword('login-password');
```

**Accessibility:**

- All inputs have associated labels
- Password toggle button has `aria-label`
- Error states use `aria-invalid` and `role="alert"`
- Keyboard navigation supported
- Focus management on toggle

**JavaScript Required:** `auth.js`

---

### Register Form

Complete registration form with name, email, password, password confirmation, and terms acceptance.

**Template Path:** `components/register_form.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | string | No | `""` | Form action URL |
| `title` | string | No | - | Form title |
| `subtitle` | string | No | - | Subtitle text below title |
| `show_name` | boolean | No | `False` | Show full name field |
| `show_terms` | boolean | No | `False` | Show terms acceptance checkbox |
| `show_login_link` | boolean | No | `False` | Show "Sign in" link |
| `login_url` | string | No | `"#"` | URL for login link |
| `terms_label` | string | No | `"I agree to the Terms of Service and Privacy Policy"` | Terms checkbox label |
| `password_help` | string | No | - | Help text for password requirements |
| `name_error` | string | No | - | Error message for name field |
| `email_error` | string | No | - | Error message for email field |
| `password_error` | string | No | - | Error message for password field |
| `password_confirm_error` | string | No | - | Error message for password confirmation |
| `error_message` | string | No | - | General error alert message |

**Usage:**

```django
{% include "components/register_form.html" with
  title="Create Account"
  subtitle="Join us today"
  action="{% url 'register' %}"
  show_name=True
  show_terms=True
  show_login_link=True
  login_url="{% url 'login' %}"
  password_help="Password must be at least 8 characters"
%}
```

**With Validation Errors:**

```django
{% include "components/register_form.html" with
  title="Register"
  action="{% url 'register' %}"
  show_name=True
  password_error="Password must be at least 8 characters"
  password_confirm_error="Passwords do not match"
%}
```

**JavaScript Features:**

Both password fields have visibility toggles:

```javascript
// Initialize auth forms
window.AdalexUI.Auth.init();
```

**Accessibility:**

- All inputs have associated labels
- Password toggle buttons have `aria-label`
- Required fields marked with `aria-required`
- Error states use `aria-invalid` and descriptive error text
- Keyboard navigation supported

**JavaScript Required:** `auth.js`

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

### Card

Flexible container for displaying content with multiple variants.

**Template Path:** `components/card.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | No | - | Card title |
| `subtitle` | string | No | - | Subtitle text below title |
| `content` | string | No | - | Main content text |
| `footer` | string (HTML) | No | - | Footer content |
| `variant` | string | No | `"default"` | Card style: `default`, `bordered`, `elevated`, `primary`, `secondary`, `statistic` |
| `size` | string | No | `"md"` | Padding size: `sm`, `md`, `lg` |
| `shadow` | boolean | No | `False` | Add box shadow |
| `border` | boolean | No | `False` | Add border |
| `interactive` | boolean | No | `False` | Add hover/active states |
| `title_level` | number | No | `3` | HTML heading level (2-6) |
| `value` | string | No | - | Large value for statistic cards |
| `label` | string | No | - | Label for statistic cards |

**Usage:**

```django
{# Basic card #}
{% include "components/card.html" with
  title="Card Title"
  subtitle="Card subtitle"
  content="This is the card content."
  variant="default"
%}

{# Elevated card #}
{% include "components/card.html" with
  title="Elevated Card"
  content="This card has a shadow instead of border."
  variant="elevated"
%}

{# Interactive card #}
{% include "components/card.html" with
  title="Clickable Card"
  content="Hover to see the effect."
  variant="default"
  interactive=True
%}

{# Statistic card #}
{% include "components/card.html" with
  value="1,234"
  label="Total Users"
  variant="statistic"
  shadow=True
%}
```

**Variants:**
- `default` - Subtle border
- `bordered` - Prominent border
- `elevated` - Shadow instead of border
- `primary` - Primary color background
- `secondary` - Secondary color background
- `statistic` - For displaying metrics

---

### Notification

Toast notifications that stack in the top-right corner with auto-dismiss.

**Template Path:** `components/notification.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | - | Notification message |
| `type` | string | No | `"info"` | Type: `info`, `success`, `warning`, `error` |
| `duration` | number | No | `5000` | Auto-dismiss time in ms (0 = no auto-dismiss) |
| `dismissible` | boolean | No | `True` | Show close button |
| `id` | string | No | - | Unique notification ID |

**Static Usage (in templates):**

```django
{% include "components/notification.html" with
  message="Your changes have been saved."
  type="success"
  dismissible=True
%}
```

**JavaScript Usage (dynamic):**

```javascript
// Show notification
window.AdalexUI.Notification.show({
  message: 'Operation completed successfully!',
  type: 'success',
  duration: 5000
});

// Convenience methods
window.AdalexUI.Notification.info('Information message');
window.AdalexUI.Notification.success('Success message');
window.AdalexUI.Notification.warning('Warning message');
window.AdalexUI.Notification.error('Error message');

// Dismiss all notifications
window.AdalexUI.Notification.dismissAll();
```

**Events:**

```javascript
document.addEventListener('notification:shown', (e) => {
  console.log('Notification shown:', e.detail);
});

document.addEventListener('notification:dismissed', (e) => {
  console.log('Notification dismissed:', e.detail);
});
```

**JavaScript Required:** `notification.js`

---

### Tabs

Accessible tabbed interface with keyboard navigation.

**Template Path:** `components/tabs.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tabs` | list | Yes | - | List of tab objects (see below) |
| `aria_label` | string | No | `"Tabs"` | ARIA label for tab list |

**Tab Object:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `id` | string | Yes | Unique tab identifier |
| `label` | string | Yes | Tab button text |
| `content` | string (HTML) | Yes | Panel content (HTML) |
| `icon` | string | No | Icon name (uses Icon component) |
| `badge` | string | No | Badge text (uses Badge component) |

**Usage:**

```python
# In views.py
tabs_data = [
    {
        'id': 'overview',
        'label': 'Overview',
        'content': '<p>Overview content here.</p>'
    },
    {
        'id': 'details',
        'label': 'Details',
        'icon': 'info',
        'content': '<p>Details content here.</p>'
    },
    {
        'id': 'notifications',
        'label': 'Notifications',
        'badge': '3',
        'content': '<p>You have 3 notifications.</p>'
    },
]
```

```django
{% include "components/tabs.html" with tabs=tabs_data %}
```

**Variants (CSS classes on container):**

```django
{# Boxed style #}
<div class="a-tabs a-tabs--boxed" data-tabs>
  ...
</div>

{# Full width tabs #}
<div class="a-tabs a-tabs--full-width" data-tabs>
  ...
</div>

{# Vertical tabs #}
<div class="a-tabs a-tabs--vertical" data-tabs>
  ...
</div>
```

**Keyboard Navigation:**
- `Arrow Left/Right` - Move between tabs (horizontal)
- `Arrow Up/Down` - Move between tabs (vertical)
- `Home` - Go to first tab
- `End` - Go to last tab
- `Enter/Space` - Activate focused tab

**JavaScript API:**

```javascript
// Initialize tabs
window.AdalexUI.Tabs.init();

// Switch to specific tab programmatically
window.AdalexUI.Tabs.switchTo(containerElement, 'tab-id');
```

**Events:**

```javascript
document.addEventListener('tabs:changed', (e) => {
  console.log('Tab changed:', e.detail.tabId);
});
```

**Accessibility:**
- `role="tablist"` on tab container
- `role="tab"` on each tab button
- `role="tabpanel"` on each panel
- `aria-selected` state on tabs
- `aria-controls` linking tabs to panels
- Keyboard navigation support

**JavaScript Required:** `tabs.js`

---

## Loading Components

### Loading Bar

Global page-level loading indicator that automatically appears during HTMX requests.

**Template Path:** `components/loading_bar.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | No | auto-generated | Unique ID for the loading bar |
| `message` | string | No | - | Optional loading message to display |
| `class` | string | No | - | Additional CSS classes |

**Usage:**

```django
<!-- Basic loading bar -->
{% include "components/loading_bar.html" %}

<!-- With message -->
{% include "components/loading_bar.html" with message="Saving changes..." %}

<!-- With custom class -->
{% include "components/loading_bar.html" with message="Loading..." class="custom-loader" %}
```

**Features:**
- Automatically integrated with HTMX requests via `loading.js`
- Smooth animations using design tokens
- Support for custom loading messages
- Fixed positioning at top of viewport
- Z-index management for proper layering

**JavaScript API:**

```javascript
// Show global loading bar
AdalexUI.Loading.showGlobalLoader();
AdalexUI.Loading.showGlobalLoader('Custom message...');

// Hide global loading bar
AdalexUI.Loading.hideGlobalLoader();
```

---

### Skeleton

Placeholder loading content with shimmer animation for various UI elements.

**Template Path:** `components/skeleton.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | Yes | - | Skeleton type: `text`, `image`, `avatar`, `button`, `card`, `table-cell` |
| `size` | string | No | `md` | Size variant: `sm`, `md`, `lg`, `xl` |
| `width` | string | No | - | Custom width (e.g., "100px", "50%") |
| `height` | string | No | - | Custom height (e.g., "20px", "100px") |
| `count` | integer | No | 1 | Number of skeleton items to generate |
| `class` | string | No | - | Additional CSS classes |
| `aria_label` | string | No | "Loading content..." | Accessibility label |

**Usage:**

```django
<!-- Text skeletons -->
{% include "components/skeleton.html" with type="text" %}
{% include "components/skeleton.html" with type="text" size="sm" count=3 %}
{% include "components/skeleton.html" with type="text" size="lg" width="80%" %}

<!-- Other types -->
{% include "components/skeleton.html" with type="avatar" size="lg" %}
{% include "components/skeleton.html" with type="button" size="sm" %}
{% include "components/skeleton.html" with type="image" %}
{% include "components/skeleton.html" with type="card" %}

<!-- Custom dimensions -->
{% include "components/skeleton.html" with type="text" width="200px" height="30px" %}

<!-- Table cells -->
{% include "components/skeleton.html" with type="table-cell" count=4 %}
```

**Skeleton Types:**

| Type | Description | Size Variants |
|------|-------------|---------------|
| `text` | Text line placeholder | `sm`, `md`, `lg`, `xl` |
| `image` | Image placeholder | N/A (responsive) |
| `avatar` | Circular avatar placeholder | `sm`, `md`, `lg` |
| `button` | Button-shaped placeholder | `sm`, `md`, `lg` |
| `card` | Card container placeholder | N/A (responsive) |
| `table-cell` | Table cell content | N/A |

**Features:**
- Shimmer animation using CSS gradients
- Responsive design with flexible sizing
- ARIA accessibility labels
- All styles use design tokens
- Smooth animation performance

---

### Loading Manager

JavaScript utility for managing loading states across buttons, forms, tables, and global indicators.

**JavaScript File:** `components/loading.js`

**Features:**
- Automatic HTMX integration
- Button loading states with spinners
- Form loading overlays
- Table skeleton loaders
- Global loading indicators
- Error handling and cleanup

**API Reference:**

#### Button Loading

```javascript
// Set button loading state
AdalexUI.Loading.setButtonLoading(buttonElement, true, 'Loading...');

// Clear button loading state  
AdalexUI.Loading.setButtonLoading(buttonElement, false);
```

**Parameters:**
- `button` (HTMLElement): Button element to modify
- `isLoading` (boolean): Loading state (true/false)
- `loadingText` (string, optional): Text to display during loading

**Features:**
- Adds spinner icon to button
- Preserves original button text
- Disables button interaction
- Supports all button variants and sizes

#### Form Loading

```javascript
// Set form loading state
AdalexUI.Loading.setFormLoading(formElement, true);

// Clear form loading state
AdalexUI.Loading.setFormLoading(formElement, false);
```

**Parameters:**
- `form` (HTMLElement): Form element to modify
- `isLoading` (boolean): Loading state (true/false)

**Features:**
- Semi-transparent overlay with spinner
- Disables all form controls
- Maintains form accessibility
- Automatic cleanup on completion

#### Table Skeleton

```javascript
// Show table skeleton loader
AdalexUI.Loading.showTableSkeleton(tableContainer, 5);

// Hide table skeleton loader
AdalexUI.Loading.hideTableSkeleton(tableContainer);
```

**Parameters:**
- `tableContainer` (HTMLElement): Table container element
- `rows` (number, optional): Number of skeleton rows (default: 5)

**Features:**
- Replaces table content with skeleton rows
- Maintains table structure and styling
- Smooth transition animations
- Restores original content when hidden

#### Global Loading

```javascript
// Show global loading indicator
AdalexUI.Loading.showGlobalLoader();
AdalexUI.Loading.showGlobalLoader('Processing request...');

// Hide global loading indicator
AdalexUI.Loading.hideGlobalLoader();
```

**Features:**
- Top-of-page progress bar
- Optional loading messages
- Reference counting for multiple concurrent operations
- Automatic integration with HTMX events

**HTMX Integration:**

The loading manager automatically handles HTMX events:

```javascript
// Automatic handlers for HTMX events
document.body.addEventListener('htmx:beforeRequest', showGlobalLoader);
document.body.addEventListener('htmx:afterRequest', hideGlobalLoader);

// Form-specific handlers
form.addEventListener('htmx:beforeRequest', setFormLoading);
form.addEventListener('htmx:afterRequest', clearFormLoading);
```

**Customization:**

Override automatic loading behavior:

```html
<!-- Skip automatic loading for this form -->
<form class="a-form" data-skip-auto-loading="true">
  <!-- form content -->
</form>

<!-- Skip automatic loading for this button -->
<button class="a-button" data-skip-auto-loading="true">
  Submit
</button>
```

**CSS Classes:**

The loading manager adds these classes:

| Class | Element | Description |
|-------|---------|-------------|
| `.a-button--loading` | Button | Button in loading state |
| `.a-form--loading` | Form | Form in loading state |
| `.a-table-container--skeleton` | Table | Table showing skeleton |
| `.a-loading-bar--visible` | Loading bar | Visible loading bar |

**Error Handling:**

All loading functions include error boundaries:

```javascript
try {
  AdalexUI.Loading.setButtonLoading(button, true);
} catch (error) {
  console.error('[Loading] Error setting button loading state:', error);
  // Graceful degradation - button remains functional
}
```

**Best Practices:**

1. **Use semantic loading states** - Button loading for form submission, skeleton for data fetching
2. **Provide loading messages** - Help users understand what's happening
3. **Handle errors gracefully** - Always clear loading states on errors
4. **Test accessibility** - Ensure loading states don't break keyboard navigation
5. **Performance** - Use skeleton loaders for perceived performance improvement

**Accessibility:**

- Loading states include `aria-busy="true"` attributes
- Skeleton loaders have proper `role="status"` and `aria-label`
- Screen reader announcements for state changes
- Keyboard navigation maintained during loading states

**JavaScript Required:** `loading.js`

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

### Confirm Dialog

Modal confirmation dialog with title, message, and action buttons. Supports danger variant for destructive actions.

**Template Path:** `components/confirm_dialog.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | Yes | - | Unique dialog ID |
| `title` | string | Yes | - | Dialog title |
| `message` | string | Yes | - | Confirmation message |
| `confirm_text` | string | No | `"Confirm"` | Confirm button text |
| `cancel_text` | string | No | `"Cancel"` | Cancel button text |
| `danger` | boolean | No | `False` | Use danger styling (red confirm button) |
| `icon` | boolean | No | `False` | Show icon (info or warning based on danger) |

**Usage:**

```django
{# Basic confirm dialog #}
{% include "components/confirm_dialog.html" with
  id="confirm-action"
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  confirm_text="Yes, Proceed"
  cancel_text="Cancel"
  icon=True
%}

{# Danger confirm dialog #}
{% include "components/confirm_dialog.html" with
  id="confirm-delete"
  title="Delete Item"
  message="This action cannot be undone. Are you sure?"
  confirm_text="Delete"
  cancel_text="Cancel"
  danger=True
  icon=True
%}
```

**JavaScript Usage:**

```javascript
// Open dialog and wait for response
const confirmed = await window.AdalexUI.ConfirmDialog.open('confirm-action');
if (confirmed) {
  // User clicked confirm
} else {
  // User clicked cancel or closed dialog
}

// Programmatic confirm (creates dynamic dialog)
const result = await window.AdalexUI.ConfirmDialog.confirm({
  title: 'Save Changes?',
  message: 'Do you want to save before leaving?',
  confirmText: 'Save',
  cancelText: 'Discard',
  danger: false
});
```

**Data Attributes (for declarative usage):**

```html
<button data-confirm-open="confirm-action">Open Confirm</button>
```

**Events:**

```javascript
document.addEventListener('confirm:opened', (e) => {
  console.log('Dialog opened:', e.detail.dialog);
});

document.addEventListener('confirm:closed', (e) => {
  console.log('Dialog closed:', e.detail.confirmed);
});
```

**Accessibility:**

- `role="alertdialog"` for accessibility
- `aria-modal="true"` for modal behavior
- `aria-labelledby` links to title
- `aria-describedby` links to message
- Focus trap within dialog
- ESC key closes dialog
- Focus returns to trigger element

**JavaScript Required:** `confirm.js`

---

### Drawer

Slide-in panel that can appear from left or right side with focus trap and keyboard support.

**Template Path:** `components/drawer.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | Yes | - | Unique drawer ID |
| `title` | string | Yes | - | Drawer title |
| `content` | string (HTML) | Yes | - | Drawer body content |
| `position` | string | No | `"right"` | Slide-in position: `"left"` or `"right"` |
| `size` | string | No | - | Drawer width: `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"` |
| `footer` | string (HTML) | No | - | Optional footer content (buttons) |

**Size Values:**

| Size | Max Width |
|------|-----------|
| `sm` | 18rem (288px) |
| `md` | 24rem (384px) - default |
| `lg` | 32rem (512px) |
| `xl` | 40rem (640px) |
| `full` | 100% |

**Usage:**

```django
{# Right drawer (default) #}
{% include "components/drawer.html" with
  id="settings-drawer"
  title="Settings"
  position="right"
  size="md"
  content="<p>Your settings content here.</p>"
%}

{# Left drawer with footer #}
{% include "components/drawer.html" with
  id="filter-drawer"
  title="Filters"
  position="left"
  size="lg"
  content="<p>Filter options here.</p>"
  footer='<button class="a-button a-button--primary">Apply Filters</button>'
%}
```

**JavaScript Usage:**

```javascript
// Open drawer
window.AdalexUI.Drawer.open('settings-drawer');

// Close drawer
window.AdalexUI.Drawer.close('settings-drawer');

// Toggle drawer
window.AdalexUI.Drawer.toggle('settings-drawer');
```

**Data Attributes (for declarative usage):**

```html
<!-- Open trigger -->
<button data-drawer-open="settings-drawer">Open Settings</button>

<!-- Toggle trigger -->
<button data-drawer-toggle="settings-drawer">Toggle Drawer</button>

<!-- Close button (inside drawer) -->
<button data-drawer-close>Close</button>
```

**Events:**

```javascript
document.addEventListener('drawer:opened', (e) => {
  console.log('Drawer opened:', e.detail.drawer);
});

document.addEventListener('drawer:closed', (e) => {
  console.log('Drawer closed:', e.detail.drawer);
});
```

**Accessibility:**

- `role="dialog"` for dialog semantics
- `aria-modal="true"` for modal behavior
- `aria-labelledby` links to title
- Focus trap within drawer
- ESC key closes drawer
- Focus returns to trigger element
- Backdrop click closes drawer

**Responsive Behavior:**

On mobile (< 480px), drawer expands to full width regardless of size setting.

**JavaScript Required:** `drawer.js`

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
# Simple links
nav_items = [
    {'url': '/dashboard/', 'text': 'Dashboard', 'active': True},
    {'url': '/products/', 'text': 'Products', 'active': False},
]

# With dropdown menus (using 'children')
nav_items = [
    {'url': '/', 'text': 'Home', 'active': True},
    {
        'text': 'Products',  # No URL for parent with children
        'active': False,
        'children': [
            {'url': '/products/list/', 'text': 'Product List', 'active': False},
            {'url': '/products/add/', 'text': 'Add Product', 'active': False},
            {'url': '/products/categories/', 'text': 'Categories', 'active': False},
        ]
    },
    {'url': '/contact/', 'text': 'Contact', 'active': False},
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
- **NEW:** Dropdown menus with nested navigation
- User dropdown
- Keyboard accessible (Tab, Arrow keys, Enter, Escape)
- Click outside to close dropdowns
- Mobile responsive dropdown behavior

**Dropdown Navigation:**
- **Desktop:** Dropdown appears below the parent menu item
- **Mobile:** Dropdown expands inline within hamburger menu
- **Keyboard:** Use Tab to focus, Arrow keys to navigate, Enter to activate, Escape to close
- **Accessibility:** Full ARIA attributes and screen reader support

**Best Practices:**
- Limit dropdown depth to 1 level (avoid nested dropdowns)
- Use descriptive text labels for better accessibility
- Keep dropdown items to 3-7 items for optimal UX
- Don't add URL to parent items that have children

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

### Detail View

Label-value grid layout for displaying detailed information.

**Template Path:** `components/detail_view.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | No | - | Header title for the detail view |
| `fields` | list | Yes | - | List of field objects (see below) |
| `actions` | list | No | - | List of action buttons (see below) |
| `class` | string | No | - | Additional CSS classes |
| `id` | string | No | - | HTML ID attribute |

**Field Object:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Field label text |
| `value` | string | Yes | Field value to display |
| `icon` | string | No | Icon name to display with value |
| `badge` | boolean | No | Display value as badge |
| `badge_variant` | string | No | Badge variant (primary, success, error, warning, info) |
| `variant` | string | No | Value text color variant (success, error, warning, info) |
| `highlight` | boolean | No | Highlight the field with background |

**Action Object:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | Yes | Button text |
| `variant` | string | No | Button variant (primary, secondary, error) |
| `href` | string | No | Button link URL |
| `onclick` | string | No | JavaScript onclick handler |
| `size` | string | No | Button size (xs, sm, md, lg) |

**Usage Example:**

```django
{% include "components/detail_view.html" with
  title="User Profile"
  fields=user_fields
  actions=user_actions
%}
```

**Python View Example:**

```python
context = {
    'user_fields': [
        {'label': 'Name', 'value': 'John Doe'},
        {'label': 'Email', 'value': 'john@example.com', 'icon': 'mail'},
        {'label': 'Status', 'value': 'Active', 'badge': True, 'badge_variant': 'success'},
        {'label': 'Department', 'value': 'Engineering', 'highlight': True},
    ],
    'user_actions': [
        {'text': 'Edit', 'variant': 'primary', 'href': '/edit/'},
        {'text': 'Delete', 'variant': 'error', 'onclick': 'confirmDelete()'},
    ]
}
```

---

### Filter Bar

Horizontal or vertical filter form with various input types.

**Template Path:** `components/filter_bar.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filters` | list | Yes | - | List of filter field configurations |
| `action` | string | No | Current URL | Form action URL |
| `active_filters` | list | No | - | List of currently active filters |
| `class` | string | No | - | Additional CSS classes (e.g., 'a-filter-bar--vertical') |
| `id` | string | No | - | HTML ID attribute |

**Filter Field Configuration:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Field type (text, search, select, date, checkbox, radio, date_range) |
| `name` | string | Yes | Field name attribute |
| `placeholder` | string | No | Placeholder text |
| `value` | string | No | Current value |
| `label` | string | No | Label for checkbox/radio |
| `options` | list | No | Options for select/radio |
| `value_from` | string | No | Start value for date_range |
| `value_to` | string | No | End value for date_range |
| `class` | string | No | Additional field classes |

**Active Filter Object:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Filter label |
| `value` | string | Yes | Filter value |

**Usage Example:**

```django
{% include "components/filter_bar.html" with
  filters=filter_config
  action="/search/"
  active_filters=active_filters
  class="a-filter-bar--sticky"
%}
```

**Python View Example:**

```python
context = {
    'filter_config': [
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
            'options': [
                {'value': '', 'label': 'All Categories'},
                {'value': 'electronics', 'label': 'Electronics'},
                {'value': 'clothing', 'label': 'Clothing'},
            ],
            'value': request.GET.get('category', ''),
        },
        {
            'type': 'date_range',
            'name': 'date',
            'value_from': request.GET.get('date_from', ''),
            'value_to': request.GET.get('date_to', ''),
        },
    ],
    'active_filters': [
        {'label': 'Search', 'value': 'laptop'},
        {'label': 'Category', 'value': 'Electronics'},
    ]
}
```

**CSS Variants:**

- `a-filter-bar--vertical`: Vertical layout for sidebars
- `a-filter-bar--sticky`: Sticky positioning

---

## File Components

### File Upload

Drag & drop file upload with validation and preview.

**Template Path:** `components/file_upload.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Input name attribute |
| `id` | string | Yes | - | Input ID attribute |
| `accept` | string | No | - | Accepted file types (e.g., 'image/*', '.pdf,.doc') |
| `multiple` | boolean | No | False | Allow multiple file selection |
| `max_size` | string | No | 10485760 | Maximum file size in bytes |
| `class` | string | No | - | Additional CSS classes |

**Usage Example:**

```django
{% include "components/file_upload.html" with
  name="documents"
  id="doc-upload"
  accept=".pdf,.doc,.docx"
  multiple=True
  max_size="5242880"
%}
```

**Features:**

- Drag & drop support
- File type validation
- File size validation
- Preview with file information
- Individual file removal
- Progress bar ready (for AJAX uploads)
- Keyboard accessible
- HTMX compatible

**JavaScript Required:** `file_upload.js`

**JavaScript API:**

```javascript
// Manual initialization
AdalexUI.initFileUpload(element);

// Access uploaded files
const uploadEl = document.querySelector('[data-file-upload]');
const files = uploadEl.files; // Array of File objects
```

**Events:**

The component fires these custom events:

- `clearAll`: Triggered when "Clear All" is clicked
- `removeFile`: Triggered when a file is removed (detail contains the file item)

**Styling:**

The component supports these states:
- `.is-dragover`: Applied during drag over
- `.is-error`: Applied when validation fails

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

## Data Components

### Table

Full-featured data table with search, sorting, pagination, and HTMX integration.

**Template Path:** `components/table.html`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `columns` | list | Yes | - | List of column definitions (see below) |
| `rows` | list/queryset | Yes | - | Data rows (list of dicts or Django QuerySet) |
| `row_actions` | list | No | - | Action buttons for each row (see below) |
| `row_partial` | string | No | - | Custom template path for row rendering |
| `searchable` | boolean | No | `False` | Enable search functionality |
| `sortable` | boolean | No | `False` | Enable column sorting |
| `paginated` | boolean | No | `False` | Enable pagination |
| `search_query` | string | No | - | Current search query |
| `search_id` | string | No | `"table-search"` | ID for search input |
| `search_placeholder` | string | No | `"Search..."` | Placeholder for search input |
| `sort_key` | string | No | - | Currently sorted column key |
| `sort_direction` | string | No | `"none"` | Sort direction: `"asc"`, `"desc"`, or `"none"` |
| `pagination_data` | dict | No | - | Pagination data (see Pagination component) |
| `empty_text` | string | No | `"No data available"` | Message when no rows |
| `aria_label` | string | No | `"Data table"` | ARIA label for table |

**Column Definition:**

Each item in `columns` should be a dictionary with:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `key` | string | Yes | Data key to display (dict key or object attribute) |
| `label` | string | Yes | Column header text |
| `sortable` | boolean | No | Enable sorting for this column |

**Row Actions Definition:**

Each item in `row_actions` should be a dictionary with:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `url_pattern` | string | Yes | URL pattern with `{key}` placeholders (e.g., `/users/{id}/edit/`) |
| `text` | string | Yes | Button text |
| `variant` | string | No | Button variant (`primary`, `secondary`, etc.) |
| `method` | string | No | HTTP method: `"get"` (default) or `"post"` |

**Usage:**

```python
# In views.py
from adalex_ui.utils import build_pagination_data
import math

def table_view(request):
    # Get query parameters
    search = request.GET.get('search', '')
    sort = request.GET.get('sort', '')
    direction = request.GET.get('direction', 'asc')
    page = int(request.GET.get('page', 1))
    page_size = 10

    # Fetch and filter data
    all_data = YourModel.objects.all()
    if search:
        all_data = all_data.filter(name__icontains=search)

    # Sort data
    if sort:
        order_by = f"{'-' if direction == 'desc' else ''}{sort}"
        all_data = all_data.order_by(order_by)

    # Paginate
    total = all_data.count()
    total_pages = math.ceil(total / page_size)
    data = all_data[(page-1)*page_size:page*page_size]

    # Build pagination
    pagination_data = build_pagination_data(
        page,
        total_pages,
        f'/your-url/?page={{page}}&search={search}&sort={sort}&direction={direction}'
    )

    # Define columns
    columns = [
        {'key': 'id', 'label': 'ID', 'sortable': True},
        {'key': 'name', 'label': 'Name', 'sortable': True},
        {'key': 'email', 'label': 'Email', 'sortable': True},
        {'key': 'status', 'label': 'Status', 'sortable': False},
    ]

    # Define actions
    row_actions = [
        {'url_pattern': '/edit/{id}/', 'text': 'Edit', 'variant': 'primary'},
        {'url_pattern': '/delete/{id}/', 'text': 'Delete', 'variant': 'secondary', 'method': 'post'},
    ]

    context = {
        'columns': columns,
        'rows': data,
        'row_actions': row_actions,
        'searchable': True,
        'sortable': True,
        'paginated': True,
        'search_query': search,
        'sort_key': sort,
        'sort_direction': direction,
        'pagination_data': pagination_data,
    }
    return render(request, 'your_template.html', context)
```

```django
{# In your_template.html #}
{% load a_ui_tags %}

{% include "components/table.html" with
  columns=columns
  rows=rows
  row_actions=row_actions
  searchable=True
  sortable=True
  paginated=True
  search_query=search_query
  sort_key=sort_key
  sort_direction=sort_direction
  pagination_data=pagination_data
%}
```

**Custom Row Template:**

For advanced row rendering, use `row_partial`:

```django
{# custom_row.html #}
{% load a_ui_tags %}
<tr class="a-table__row">
  <td class="a-table__cell">{{ row|get_item:"id" }}</td>
  <td class="a-table__cell">
    <strong>{{ row|get_item:"name" }}</strong>
    {% include "components/badge.html" with text=row.status variant="success" size="sm" %}
  </td>
  <td class="a-table__cell a-table__cell--actions">
    {# Custom actions #}
  </td>
</tr>
```

```django
{# In main template #}
{% include "components/table.html" with
  row_partial="custom_row.html"
  ...
%}
```

**HTMX Integration:**

The table automatically uses HTMX for search, sort, and pagination when available:

```html
<!-- Include HTMX -->
<script src="https://unpkg.com/htmx.org@1.9.10"></script>

<!-- Include table JS -->
<script src="{% static 'a-ui/js/components/table.js' %}"></script>
```

**Responsive Behavior:**

Default: Horizontal scroll on mobile
- Table remains structured
- Scroll container preserves layout

Stacked layout: Add `.a-table-container--stacked` class
- Rows become cards
- Labels appear inline with values
- Better for narrow screens

**Variants:**

Add classes to `.a-table` element:
- `.a-table--striped` - Alternating row colors
- `.a-table--compact` - Reduced padding
- `.a-table--bordered` - Cell borders

**Accessibility:**

- Semantic `<table>` structure with proper roles
- Sortable headers are keyboard accessible (Enter/Space)
- ARIA attributes for sort states
- Screen reader announcements
- Focus management
- Empty state messaging

**JavaScript API:**

```javascript
// Initialize tables
window.AdalexUI.Table.init();

// Refresh table data
window.AdalexUI.Table.refresh('#my-table-container');

// Listen to events
document.addEventListener('table:sorted', (e) => {
  console.log('Sorted by:', e.detail.sortKey, e.detail.direction);
});

document.addEventListener('table:searched', (e) => {
  console.log('Search query:', e.detail.query);
});
```

**Best Practices:**

1. **Always provide `aria_label`** for context
2. **Use pagination** for large datasets (>50 rows)
3. **Limit sortable columns** to meaningful fields
4. **Provide clear empty states** with actionable messages
5. **Test keyboard navigation** on sortable headers
6. **Consider custom row templates** for complex data
7. **Use HTMX** for seamless updates without page reloads
8. **Handle loading states** with `.a-table-container--loading`

---

## JavaScript Components

Components requiring JavaScript are automatically initialized on page load and after HTMX swaps.

**Required Scripts:**

```django
{# Individual components #}
<script src="{% static 'a-ui/js/components/alert.js' %}"></script>
<script src="{% static 'a-ui/js/components/auth.js' %}"></script>
<script src="{% static 'a-ui/js/components/confirm.js' %}"></script>
<script src="{% static 'a-ui/js/components/drawer.js' %}"></script>
<script src="{% static 'a-ui/js/components/form.js' %}"></script>
<script src="{% static 'a-ui/js/components/modal.js' %}"></script>
<script src="{% static 'a-ui/js/components/navbar.js' %}"></script>
<script src="{% static 'a-ui/js/components/notification.js' %}"></script>
<script src="{% static 'a-ui/js/components/sidebar.js' %}"></script>
<script src="{% static 'a-ui/js/components/table.js' %}"></script>
<script src="{% static 'a-ui/js/components/tabs.js' %}"></script>
<script src="{% static 'a-ui/js/components/tooltip.js' %}"></script>

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

## Accessibility

Adalex UI is designed with accessibility as a core principle, following Web Content Accessibility Guidelines (WCAG) 2.1 AA standards. All components include proper semantic markup, ARIA attributes, and comprehensive keyboard navigation support.

### Keyboard Navigation

#### Global Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move forward through interactive elements |
| `Shift + Tab` | Move backward through interactive elements |
| `Enter` | Activate buttons and form submissions |
| `Space` | Activate buttons and toggles |
| `Escape` | Close modals, drawers, tooltips, and dismiss alerts |

#### Component-Specific Navigation

**Tabs Component**
| Key | Action |
|-----|--------|
| `Left Arrow` | Previous tab (horizontal layout) |
| `Right Arrow` | Next tab (horizontal layout) |
| `Up Arrow` | Previous tab (vertical layout) |
| `Down Arrow` | Next tab (vertical layout) |
| `Home` | First tab |
| `End` | Last tab |

**Table Component**
| Key | Action |
|-----|--------|
| `Up/Down Arrows` | Navigate between rows |
| `Left/Right Arrows` | Navigate between cells |
| `Home` | First cell in current row |
| `End` | Last cell in current row |
| `Ctrl/Cmd + Home` | First cell of table |
| `Ctrl/Cmd + End` | Last cell of table |
| `Enter/Space` | Activate sortable headers |

**Modal/Drawer Focus Trap**
- Focus is automatically moved to the first focusable element
- `Tab` and `Shift+Tab` cycle through focusable elements within the modal/drawer
- Focus is returned to the trigger element when closed
- `Escape` key closes the modal/drawer

### Screen Reader Support

All components are tested with popular screen readers:
- **NVDA** (Windows) - Free and open source
- **JAWS** (Windows) - Commercial screen reader
- **VoiceOver** (macOS/iOS) - Built into Apple devices
- **TalkBack** (Android) - Built into Android devices

#### Screen Reader Features

**Form Components**
- Proper label associations with `for` and `id` attributes
- Error messages linked via `aria-describedby`
- Required fields indicated with `aria-required="true"`
- Invalid states announced with `aria-invalid="true"`

**Interactive Components**
- Descriptive button labels and `aria-label` attributes
- State changes announced for toggles and selections
- Loading states communicated via `aria-busy` and live regions

**Dynamic Content**
- Alert and notification components use `aria-live` regions
- Error alerts use `aria-live="assertive"` for immediate announcement
- Info/success alerts use `aria-live="polite"` for non-intrusive announcement

### Focus Management

#### Visual Focus Indicators

All interactive elements have clearly visible focus indicators using CSS design tokens:
- `--focus-ring-primary` - Main focus ring color
- `--focus-ring-error` - Error state focus ring
- `--focus-ring-success` - Success state focus ring

#### Focus Trapping

Modal and drawer components implement robust focus trapping:
- Focus moves to the first focusable element when opened
- Tab navigation is constrained within the component
- Focus returns to the trigger element when closed
- Escape key provides alternative dismissal method

#### Focus Restoration

The keyboard navigation utility provides focus restoration:
- Saves focus state before component interactions
- Restores focus after dynamic content changes
- Handles edge cases where original element is no longer available

### ARIA Attributes

#### Roles and Properties

**Form Controls**
```html
<!-- Text Input with Error -->
<input 
  aria-required="true"
  aria-invalid="true" 
  aria-describedby="field-error"
/>
<span id="field-error" role="alert">Error message</span>

<!-- Select with Options -->
<select aria-label="Choose country">
  <option>United States</option>
  <option disabled>Canada (unavailable)</option>
</select>
```

**Interactive Widgets**
```html
<!-- Modal -->
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-hidden="false"
>
  <h2 id="modal-title">Modal Title</h2>
</div>

<!-- Tabs -->
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Privacy
  </button>
</div>
<div role="tabpanel" id="panel-1">...</div>
```

**Data Tables**
```html
<table role="table" aria-label="User data">
  <thead>
    <tr>
      <th scope="col" 
          role="button" 
          tabindex="0"
          aria-sort="ascending">
        Name
      </th>
    </tr>
  </thead>
</table>
```

#### Live Regions

Dynamic content uses appropriate `aria-live` regions:

```html
<!-- Polite announcements (non-urgent) -->
<div aria-live="polite" aria-atomic="true">
  Form saved successfully
</div>

<!-- Assertive announcements (urgent) -->
<div aria-live="assertive" aria-atomic="true">
  Connection lost - please try again
</div>

<!-- Status updates -->
<div role="status" aria-live="polite">
  Loading... 45% complete
</div>
```

### WCAG 2.1 Compliance

#### Level AA Requirements Met

**Perceivable**
- ✅ **1.3.1 Info and Relationships**: Semantic markup and ARIA labels
- ✅ **1.3.2 Meaningful Sequence**: Logical tab order and heading structure
- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 ratio for normal text, 3:1 for large text
- ✅ **1.4.11 Non-text Contrast**: 3:1 ratio for UI components and graphics

**Operable**
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **2.1.2 No Keyboard Trap**: Focus can always move away from components
- ✅ **2.4.3 Focus Order**: Logical and predictable focus sequence
- ✅ **2.4.7 Focus Visible**: Clear visual focus indicators

**Understandable**
- ✅ **3.2.1 On Focus**: No unexpected context changes on focus
- ✅ **3.2.2 On Input**: No unexpected context changes on input
- ✅ **3.3.1 Error Identification**: Errors clearly identified and described
- ✅ **3.3.2 Labels or Instructions**: Clear labels and instructions provided

**Robust**
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA implementation
- ✅ **4.1.3 Status Messages**: Important messages communicated to assistive technology

#### Testing Recommendations

**Keyboard Testing**
1. Tab through all interactive elements
2. Verify focus indicators are visible
3. Test escape key on dismissible components
4. Verify arrow key navigation in applicable components

**Screen Reader Testing**
1. Navigate with screen reader only
2. Verify all content is announced
3. Test form field labels and error messages
4. Confirm live region announcements

**Automated Testing**
- Use tools like axe-core, WAVE, or Lighthouse accessibility audit
- Integrate accessibility testing in CI/CD pipeline
- Regular manual testing with real assistive technologies

#### Implementation Examples

**Accessible Form**
```django
{% include "components/form.html" with 
  id="contact-form"
  title="Contact Us"
  description="Send us a message and we'll get back to you"
  fields=form_fields
  aria_label="Contact form"
%}
```

**Accessible Table with Keyboard Navigation**
```django
{% include "components/table.html" with
  columns=columns
  rows=data
  aria_label="User management table"
  searchable=True
  sortable=True
%}
```

**Accessible Modal**
```django
{% include "components/modal.html" with
  id="delete-confirmation"
  title="Confirm Deletion"
  content="Are you sure you want to delete this item?"
  aria_describedby="delete-warning"
%}
```

### Best Practices

#### Development Guidelines

1. **Always use semantic HTML** as the foundation
2. **Pair every form control with a proper label**
3. **Provide alternative text** for meaningful images
4. **Use ARIA attributes** to enhance semantics, not replace them
5. **Test with keyboard only** during development
6. **Verify screen reader experience** regularly
7. **Maintain logical heading structure** (h1 → h2 → h3)
8. **Ensure sufficient color contrast** for all text
9. **Make interactive elements large enough** (44px minimum touch target)
10. **Provide clear error messages** with recovery suggestions

#### Common Patterns

**Error Handling**
```django
{% include "components/text_input.html" with
  id="email"
  name="email"
  type="email"
  label="Email Address"
  required=True
  error="Please enter a valid email address"
  aria_describedby="email-help"
%}
<span id="email-help">We'll use this to send you updates</span>
```

**Loading States**
```html
<button aria-busy="true" aria-describedby="loading-status">
  Save Changes
</button>
<div id="loading-status" aria-live="polite">
  Saving your changes...
</div>
```

**Progressive Enhancement**
```html
<!-- Works without JavaScript -->
<form method="POST" action="/submit">
  <!-- Enhanced with JavaScript for better UX -->
  <div data-component="enhanced-form">
    <!-- Form fields -->
  </div>
</form>
```

---

## Carousel Component

### Overview
Interactive image carousel/slider with multiple variants, touch support, keyboard navigation, and autoplay functionality.

### Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `id` | string | - | Yes | Unique carousel identifier |
| `items` | list | - | Yes | List of carousel items (see item structure below) |
| `autoplay` | boolean | False | No | Enable automatic slide progression |
| `autoplay_interval` | number | 5000 | No | Autoplay interval in milliseconds |
| `show_indicators` | boolean | True | No | Show slide indicator dots |
| `show_arrows` | boolean | True | No | Show navigation arrows |
| `loop` | boolean | True | No | Enable continuous loop navigation |
| `slides_per_view` | number | 1 | No | Number of slides visible at once (1, 2, or 3) |
| `variant` | string | 'default' | No | Carousel variant (default, hero, card, thumbnail) |
| `aria_label` | string | 'Image carousel' | No | Accessibility label for the carousel |

### Item Structure

Each item in the `items` list should have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_url` | string | Yes | URL of the image to display |
| `alt` | string | Yes | Alternative text for the image |
| `title` | string | No | Title text (displayed in some variants) |
| `description` | string | No | Description text (displayed in some variants) |
| `link` | string | No | Optional link URL |

### Variants

#### Default
Standard image carousel with optional title and description below the image.

```django
{% include 'components/carousel.html' with 
  id='carousel-1'
  items=product_images
  variant='default'
  autoplay=False
  show_indicators=True
  show_arrows=True
%}
```

#### Hero
Full-width carousel with overlay text and call-to-action buttons. Perfect for landing page banners.

```django
{% include 'components/carousel.html' with 
  id='hero-carousel'
  items=hero_slides
  variant='hero'
  autoplay=True
  autoplay_interval=7000
  loop=True
%}
```

#### Card
Carousel displaying multiple card components simultaneously. Great for product showcases.

```django
{% include 'components/carousel.html' with 
  id='product-carousel'
  items=products
  variant='card'
  slides_per_view=3
  show_indicators=True
  show_arrows=True
%}
```

#### Thumbnail
Gallery-style carousel with thumbnail navigation at the bottom instead of dot indicators.

```django
{% include 'components/carousel.html' with 
  id='gallery'
  items=gallery_images
  variant='thumbnail'
  show_indicators=False
  show_arrows=True
%}
```

### JavaScript API

```javascript
// Get carousel instance
const carousel = document.querySelector('#my-carousel');
const instance = carousel.adalexCarousel;

// Navigate programmatically
instance.next();
instance.prev();
instance.goToSlide(2);

// Control autoplay
instance.togglePlayPause();
instance.startAutoplay();
instance.pauseAutoplay();

// Listen to events
carousel.addEventListener('carousel:change', (e) => {
  console.log('Current slide:', e.detail.index);
});

carousel.addEventListener('carousel:slide-start', (e) => {
  console.log('Sliding from', e.detail.from, 'to', e.detail.to);
});

carousel.addEventListener('carousel:slide-end', (e) => {
  console.log('Slide complete');
});
```

### Features

#### Touch/Swipe Support
- Natural swipe gestures on mobile devices
- Mouse drag support on desktop
- Smooth transitions with momentum

#### Keyboard Navigation
- `Arrow Left`: Previous slide
- `Arrow Right`: Next slide
- `Space`: Toggle play/pause (when autoplay is enabled)

#### Autoplay Controls
- Automatic pause on hover
- Play/pause button when autoplay is enabled
- Respects `prefers-reduced-motion` preference

#### Responsive Design
- Single slide on mobile by default
- Multiple slides on larger screens (when configured)
- Touch-friendly navigation controls

### Accessibility

- **ARIA Labels**: Complete carousel region labeling
- **Role Descriptions**: Proper carousel and slide roles
- **Current State**: `aria-current` on active indicator
- **Live Regions**: Announcements for slide changes
- **Keyboard Support**: Full keyboard navigation
- **Focus Management**: Proper focus trap when interacting
- **Reduced Motion**: Respects user preference for reduced motion

### Usage Examples

#### Basic Image Slider
```django
{% with images=product.images.all %}
  {% include 'components/carousel.html' with 
    id='product-images'
    items=images
    variant='default'
    show_indicators=True
    show_arrows=True
    loop=True
  %}
{% endwith %}
```

#### Hero Banner with Autoplay
```django
{% include 'components/carousel.html' with 
  id='homepage-hero'
  items=hero_banners
  variant='hero'
  autoplay=True
  autoplay_interval=5000
  show_indicators=True
  show_arrows=False
%}
```

#### Product Showcase (Multiple Cards)
```django
{% include 'components/carousel.html' with 
  id='featured-products'
  items=featured_products
  variant='card'
  slides_per_view=3
  show_indicators=False
  show_arrows=True
  loop=True
%}
```

#### Image Gallery with Thumbnails
```django
{% include 'components/carousel.html' with 
  id='property-gallery'
  items=property_photos
  variant='thumbnail'
  show_indicators=False
  show_arrows=True
  loop=False
%}
```

### CSS Customization

The carousel component uses design tokens for all colors and styling:

```scss
// Override carousel styles
.a-carousel {
  // Custom height for hero variant
  &--hero .a-carousel__image--hero {
    height: 600px;
  }
  
  // Custom indicator styles
  &__indicator-dot {
    background: var(--primary-main);
  }
  
  // Custom arrow styles
  &__arrow {
    background: var(--neutral-white-90);
    
    &:hover {
      background: var(--neutral-white);
    }
  }
}
```

### Best Practices

1. **Always provide meaningful alt text** for all images
2. **Use appropriate variant** for your use case
3. **Consider autoplay carefully** - avoid for critical content
4. **Test touch interactions** on mobile devices
5. **Provide sufficient contrast** for overlay text in hero variant
6. **Keep slide counts reasonable** for performance
7. **Use lazy loading** for images when appropriate
8. **Test keyboard navigation** thoroughly
9. **Ensure sufficient time** for users to read content when using autoplay
10. **Provide pause controls** when autoplay is enabled

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See main project LICENSE file.
