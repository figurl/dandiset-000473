"""
system hash: 018cc447e6aebe00552018534d32b5af171baacc
// system load_dandi_tool/load_dandi_tool.md
// system submit_jobs_tool/submit_jobs_tool.md

=======================
For each asset (aka session) in Dandiset 000473

Print the asset path (also known as the session path)

Submit a multiscale_spike_density job. Use /units as the units path.

Print the job id and status

If the status of the job is "completed" then print the url of the output named "output".

Similar for rastermap job: Use /units as the units path, print the job id and status, and if the status is "completed" then print the url of the output named "output".

Print an empty line.
=======================

Assemble a JSON object with the following structure

[
    {
        "session_path": "[session path]",
        "nwb_url": "[nwb_url]",
        "neurosift_url": "https://neurosift.app/?p=/nwb&url=[nwb_url]&dandisetId=000473
        "multiscale_spike_density": {
            "job_id": "[job id]",
            "status": "[status]",
            "output_url": "[output url]"  # empty string if status is not "completed"
        },
        "rastermap": {
            "job_id": "[job id]",
            "status": "[status]",
            "output_url": "[output url]"  # empty string if status is not "completed"
        }
    }
]

Write the json object to a file called "sessions.json"

Then copy this file to ../../gui/src/sessions.json
"""

import json
import shutil
import load_dandi_tool
import submit_jobs_tool

# Get the dandiset by ID
dandiset = load_dandi_tool.get_dandiset_by_id('000473')

# Get all NWB files (assets/sessions) in the dandiset
nwb_files = dandiset.get_nwb_files(limit=None)

# List to store session data
sessions_data = []

# Loop through each nwb file (session)
for nwb_file in nwb_files:
    # Print the asset path (session path)
    print(f"Session path: {nwb_file.file_path}")

    # Submit a multiscale_spike_density job
    multiscale_job = submit_jobs_tool.submit_multiscale_spike_density_job(
        dandiset_id=dandiset.dandiset_id,
        nwb_url=nwb_file.download_url,
        units_path='/units'
    )

    # Print job id and status for multiscale_spike_density
    print(f"Multiscale Spike Density Job ID: {multiscale_job.jobId}, Status: {multiscale_job.status}")

    # Get output URL if job is completed
    multiscale_output_url = ""
    if multiscale_job.status == "completed":
        for output in multiscale_job.outputFileResults:
            if output.name == "output":
                multiscale_output_url = output.url
                print(f"Multiscale Spike Density Output URL: {multiscale_output_url}")

    # Submit a rastermap job
    rastermap_job = submit_jobs_tool.submit_rastermap_job(
        dandiset_id=dandiset.dandiset_id,
        nwb_url=nwb_file.download_url,
        units_path='/units'
    )

    # Print job id and status for rastermap
    print(f"Rastermap Job ID: {rastermap_job.jobId}, Status: {rastermap_job.status}")

    # Get output URL if job is completed
    rastermap_output_url = ""
    if rastermap_job.status == "completed":
        for output in rastermap_job.outputFileResults:
            if output.name == "output":
                rastermap_output_url = output.url
                print(f"Rastermap Output URL: {rastermap_output_url}")

    # Print an empty line
    print("")

    # Append session data to the list
    session_data = {
        "session_path": nwb_file.file_path,
        "nwb_url": nwb_file.download_url,
        "neurosift_url": f"https://neurosift.app/?p=/nwb&url={nwb_file.download_url}&dandisetId=000473",
        "multiscale_spike_density": {
            "job_id": multiscale_job.jobId,
            "status": multiscale_job.status,
            "output_url": multiscale_output_url
        },
        "rastermap": {
            "job_id": rastermap_job.jobId,
            "status": rastermap_job.status,
            "output_url": rastermap_output_url
        }
    }

    sessions_data.append(session_data)

# Write the JSON object to a file called "sessions.json"
with open("sessions.json", "w") as f:
    json.dump(sessions_data, f, indent=4)

# Copy the sessions.json file to ../../gui/src/sessions.json
shutil.copyfile("sessions.json", "../../gui/src/sessions.json")