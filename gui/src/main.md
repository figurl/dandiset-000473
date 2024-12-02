# Dandiset 000473

This is an interactive view of [Dandiset 000473](https://dandiarchive.org/dandiset/000473/0.230417.1502). It is meant to showcase some Neurosift widgets and how they can be included in an interactive document.

This dataset is part of the data used in [A Prefrontal Cortex Map based on Single Neuron Activity](https://www.biorxiv.org/content/10.1101/2024.11.06.622308v2) (preprint).

For each session, a zoomable spike density plot (similar to a raster plot) is shown. The horizontal axis is time and the vertical axis is the neuron number. The data are prepared in a multiscale array for efficient rendering. Zoom in to see the structure of the spikes.

The first session also has some behavior data in addition to the spike data.

Clicking on each session will take you to the Neurosift view for that session.

You can control whether to use [Rastermap ordering](https://github.com/MouseLand/rastermap) of the units using the following selector:

<div class="use-rastermap-selector"></div>

{% for session in sessions %}
### [{{ session.session_path }}]({{ session.neurosift_url}})
<div class="session" session_path="{{ session.session_path }}"></div>
{% endfor %}
