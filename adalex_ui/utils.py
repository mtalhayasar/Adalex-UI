"""
Adalex UI Utilities

Helper functions for components.
"""


def build_pagination_data(current_page, total_pages, url_pattern, max_visible=7):
    """
    Build pagination data for template rendering.

    Args:
        current_page (int): Current active page number (1-indexed)
        total_pages (int): Total number of pages
        url_pattern (str): URL pattern with {page} placeholder (e.g., "/items/?page={page}")
        max_visible (int): Maximum number of page links to show

    Returns:
        dict: Pagination data ready for template rendering with keys:
            - pages: List of page dicts with 'number', 'url', 'is_active', 'is_ellipsis'
            - prev_url: URL for previous page or None
            - next_url: URL for next page or None

    Example:
        >>> pagination = build_pagination_data(5, 10, "/items/?page={page}")
        >>> pagination['pages']
        [
            {'number': 1, 'url': '/items/?page=1', 'is_active': False, 'is_ellipsis': False},
            {'number': None, 'url': None, 'is_active': False, 'is_ellipsis': True},
            {'number': 4, 'url': '/items/?page=4', 'is_active': False, 'is_ellipsis': False},
            {'number': 5, 'url': '/items/?page=5', 'is_active': True, 'is_ellipsis': False},
            ...
        ]
    """
    pages = []

    # Calculate which pages to show
    if total_pages <= max_visible:
        # Show all pages
        page_numbers = range(1, total_pages + 1)
    else:
        # Smart pagination with ellipsis
        half = max_visible // 2
        if current_page <= half + 1:
            # Near start
            page_numbers = list(range(1, max_visible - 1)) + [None, total_pages]
        elif current_page >= total_pages - half:
            # Near end
            page_numbers = [1, None] + list(range(total_pages - max_visible + 3, total_pages + 1))
        else:
            # Middle
            page_numbers = (
                [1, None] +
                list(range(current_page - half + 2, current_page + half - 1)) +
                [None, total_pages]
            )

    # Build page data
    for num in page_numbers:
        if num is None:
            pages.append({
                'number': None,
                'url': None,
                'is_active': False,
                'is_ellipsis': True,
            })
        else:
            pages.append({
                'number': num,
                'url': url_pattern.replace('{page}', str(num)),
                'is_active': num == current_page,
                'is_ellipsis': False,
            })

    # Build prev/next URLs
    prev_url = None if current_page <= 1 else url_pattern.replace('{page}', str(current_page - 1))
    next_url = None if current_page >= total_pages else url_pattern.replace('{page}', str(current_page + 1))

    return {
        'pages': pages,
        'prev_url': prev_url,
        'next_url': next_url,
    }
