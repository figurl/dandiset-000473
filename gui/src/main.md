# Dandiset 000473

This is an interactive view of the data from [Dandiset 000473](https://dandiarchive.org/dandiset/000473/0.230417.1502).

Preprint: [A Prefrontal Cortex Map based on Single Neuron Activity](https://www.biorxiv.org/content/10.1101/2024.11.06.622308v2)


{% for session in sessions %}
### {{ session.session_path }}
<div class="session" session_path="{{ session.session_path }}"></div>
{% endfor %}
