# Adalex UI

A reusable Django UI component library with a unified design token system.

## Features

- **Design Token System**: Centralized color, spacing, and shadow tokens via CSS variables
- **Portable Components**: Easy integration into any Django project via `INSTALLED_APPS`
- **Accessibility First**: ARIA attributes, keyboard navigation, and proper contrast ratios
- **HTMX Compatible**: Components work seamlessly with HTMX swaps
- **BEM-style Naming**: Consistent and predictable CSS class structure

## Project Structure

```
adalex-ui/
├── adalex_ui/           # Main Django app (reusable library)
│   ├── templates/       # Component templates
│   ├── static/a-ui/     # CSS, JS, and assets
│   └── templatetags/    # Custom template tags
├── examples/playground/ # Demo Django project
├── docs/                # Documentation
└── tests/               # Test suite
```

## Installation

### For Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mtalhayasar/adalex-ui.git
   cd adalex-ui
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

5. **Build CSS from SCSS:**
   ```bash
   npm run css:build
   ```

### Running the Playground

The playground is a demo Django project showcasing all components:

```bash
cd examples/playground
python manage.py migrate
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to see component demos.

### Development Workflow

**Watch SCSS for changes:**
```bash
npm run css:watch
```

**Build production CSS:**
```bash
npm run css:build
```

**Run tests:**
```bash
pytest
```

## Usage in Your Django Project

### Option 1: Using Pre-compiled CSS (Recommended)

1. **Install the package:**
   ```bash
   pip install adalex-ui
   ```
   or
   ```bash
   pip install git+https://github.com/mtalhayasar/Adalex-UI.git
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

### Option 2: Compiling SCSS Yourself (For Customization)

If you want to customize design tokens or modify SCSS:

1. **Copy SCSS files to your project:**
   ```bash
   # Copy the scss directory from adalex_ui/static/a-ui/scss/ to your project
   cp -r path/to/adalex_ui/static/a-ui/scss/ your_project/static/scss/
   ```

2. **Install Node.js dependencies in your project:**
   ```bash
   npm init -y  # If you don't have package.json
   npm install --save-dev sass
   ```

3. **Add build scripts to your `package.json`:**
   ```json
   {
     "scripts": {
       "css:build": "sass static/scss/main.scss static/css/adalex-ui.css --style=compressed",
       "css:watch": "sass static/scss/main.scss static/css/adalex-ui.css --watch"
     }
   }
   ```

4. **Customize tokens in `_tokens.scss`:**
   ```scss
   // Modify colors, shadows, or any design tokens
   :root {
     --primary-main: #your-color;
     // ... other customizations
   }
   ```

5. **Build CSS:**
   ```bash
   npm run css:build
   ```

6. **Include your custom CSS:**
   ```html
   <link rel="stylesheet" href="{% static 'css/adalex-ui.css' %}">
   ```

### Option 3: Django-Compressor Integration

For automatic SCSS compilation in Django:

1. **Install django-compressor and django-sass-processor:**
   ```bash
   pip install django-compressor django-sass-processor
   ```

2. **Configure in `settings.py`:**
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'adalex_ui',
       'compressor',
       'sass_processor',
   ]

   STATICFILES_FINDERS = [
       'django.contrib.staticfiles.finders.FileSystemFinder',
       'django.contrib.staticfiles.finders.AppDirectoriesFinder',
       'sass_processor.finders.CssFinder',
   ]

   SASS_PROCESSOR_ROOT = STATIC_ROOT
   ```

3. **Use in templates:**
   ```html
   {% load sass_tags %}
   <link rel="stylesheet" href="{% sass_src 'a-ui/scss/main.scss' %}">
   ```

## Development Principles

### 1. Design Tokens
- All colors, shadows, and spacing come from CSS variables
- Never use hard-coded color values
- `_tokens.scss` is the single source of truth

### 2. Portability
- Components work with just `INSTALLED_APPS` + `{% include %}`
- Minimal external dependencies
- Zero-config portability

### 3. Accessibility
- Every form element has proper `label[for]` + `id` association
- ARIA attributes included
- Keyboard navigation supported
- Contrast ratios maintained

### 4. HTMX Compatibility
- JavaScript modules use idempotent initialization
- Event delegation preferred
- Re-initialize after `htmx:afterSwap`

### 5. BEM-like Naming
- `.a-component-name` (block)
- `.a-component-name__element` (element)
- `.a-component-name--variant` (modifier)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Resources

- [Documentation](https://github.com/mtalhayasar/Adalex-UI/tree/main/docs)
- [Issue Tracker](https://github.com/mtalhayasar/Adalex-UI/issues)
- [Changelog](CHANGELOG.md)
