"""Views for demo app"""

from django.shortcuts import render


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
