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

Print an empty line.
=======================

Assemble a JSON object with the following structure

[
    {
        "session_path": "[session path]",
        "nwb_url": "[nwb url]",
        "multiscale_spike_density": {
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
from submit_jobs_tool import submit_multiscale_spike_density_job

# Load the dandiset by ID
dandiset = load_dandi_tool.get_dandiset_by_id('000473')

# Get all NWB files in the dandiset
nwb_files = dandiset.get_nwb_files(limit=None)

# Initialize a list to hold the session data for JSON output
session_data = []

# Iterate over NWB files and process each
for nwb_file in nwb_files:
    session_path = nwb_file.file_path
    nwb_url = nwb_file.download_url
    
    # Print the session path
    print(f"Session Path: {session_path}")

    # Submit a multiscale_spike_density job
    job = submit_multiscale_spike_density_job(
        dandiset_id=dandiset.dandiset_id,
        nwb_url=nwb_url,
        units_path='/units'
    )
    
    # Retrieve job ID and status
    job_id = job.jobId
    status = job.status
    print(f"Job ID: {job_id}")
    print(f"Status: {status}")
    
    output_url = ""
    if status == "completed":
        # Find the output named "output" and get its URL
        for output in job.outputFileResults:
            if output.name == "output":
                output_url = output.url
                print(f"Output URL: {output_url}")
                break
    
    # Print an empty line
    print()
    
    # Append the session data to the list
    session_data.append({
        "session_path": session_path,
        "nwb_url": nwb_url,
        "multiscale_spike_density": {
            "job_id": job_id,
            "status": status,
            "output_url": output_url
        }
    })

# Write the JSON object to a file called "sessions.json"
with open("sessions.json", "w") as f:
    json.dump(session_data, f, indent=4)

# Copy the JSON file to the desired location
shutil.copy("sessions.json", "../../gui/src/sessions.json")