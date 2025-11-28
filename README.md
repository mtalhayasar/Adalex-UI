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

- [Documentation](https://github.com/mtalhayasar/adalex-ui/docs)
- [Issue Tracker](https://github.com/yourusername/adalex-ui/issues)
- [Changelog](CHANGELOG.md)
