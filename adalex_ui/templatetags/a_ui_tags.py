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
