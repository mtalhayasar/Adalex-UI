"""
Adalex UI Template Tags and Filters.

Custom template tags and filters for the Adalex UI component library.
"""
from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """
    Safe accessor for dictionary or object attributes.

    Usage in templates:
        {{ my_dict|get_item:"key_name" }}
        {{ my_object|get_item:"attribute_name" }}

    Args:
        dictionary: Dictionary or object to access
        key: String key or attribute name

    Returns:
        Value from dictionary/object or None if not found
    """
    if dictionary is None:
        return None

    # Try dictionary access first
    if isinstance(dictionary, dict):
        return dictionary.get(key)

    # Try object attribute access
    return getattr(dictionary, key, None)


@register.filter
def format_with(pattern, obj):
    """
    Format a string pattern with object attributes or dictionary values.

    Usage in templates:
        {{ "/users/{id}/edit/"|format_with:user }}
        {{ "/items/{item_id}/delete/"|format_with:item_dict }}

    Args:
        pattern: String pattern with {key} placeholders
        obj: Dictionary or object with values to insert

    Returns:
        Formatted string with placeholders replaced
    """
    if pattern is None or obj is None:
        return pattern

    # If obj is a dictionary
    if isinstance(obj, dict):
        try:
            return pattern.format(**obj)
        except (KeyError, ValueError):
            return pattern

    # If obj is an object, convert its attributes to dict
    try:
        obj_dict = {key: getattr(obj, key, None) for key in dir(obj) if not key.startswith('_')}
        return pattern.format(**obj_dict)
    except (KeyError, ValueError, AttributeError):
        return pattern
