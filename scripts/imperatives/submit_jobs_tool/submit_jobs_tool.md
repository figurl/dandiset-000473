submit_jobs_tool is a python package for submitting neurosift-related dendro jobs. I am going to teach you how to use submit_jobs_tool.

```python
# Submit a multiscale spike density job
job = submit_multiscale_spike_density_job(
    dandiset_id='[dandiset_id]',
    nwb_url='[nwb_url]',
    units_path='[units_path]'
)

# Submit a rastermap job
job = submit_rastermap_job(
    dandiset_id='[dandiset_id]',
    nwb_url='[nwb_url]',
    units_path='[units_path]'
)
```

The nwb_url is the same as the nwb_file.download_url from the load_dandi_tool package.

Each job object has the following attributes:

```python
class DendroJob(BaseModel):
    jobId: str
    jobPrivateKey: Union[str, None] = None
    serviceName: str
    userId: str
    batchId: str
    tags: List[str]
    jobDefinition: DendroJobDefinition
    jobDefinitionHash: str
    jobDependencies: List[str]
    requiredResources: DendroJobRequiredResources
    targetComputeClientIds: Union[List[str], None] = None
    secrets: Union[List[DendroJobSecret], None] = None
    inputFileUrlList: List[str]
    outputFileUrlList: List[str]
    outputFileResults: List[DendroJobOutputFileResult]
    consoleOutputUrl: str
    resourceUtilizationLogUrl: str
    timestampCreatedSec: float
    timestampStartingSec: Union[float, None] = None
    timestampStartedSec: Union[float, None] = None
    timestampFinishedSec: Union[float, None] = None
    timestampUpdatedSec: Union[float, None] = None
    canceled: bool
    status: str
    isRunnable: bool
    error: Union[str, None] = None
    computeClientId: Union[str, None] = None
    computeClientName: Union[str, None] = None
    computeClientUserId: Union[str, None] = None
    imageUri: Union[str, None] = None

class DendroJobOutputFileResult(BaseModel):
    name: str
    fileBaseName: str
    url: str
    size: Union[int, None]
```
