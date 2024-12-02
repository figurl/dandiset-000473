/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, useEffect, useState } from "react";
import { SetupTimeseriesSelection } from "./neurosift-lib/contexts/context-timeseries-selection";
import IfHasBeenVisible from "./neurosift-lib/viewPlugins/PSTH/IfHasBeenVisible";
import NwbTimeseriesView from "./neurosift-lib/viewPlugins/TimeSeries/TimeseriesItemView/NwbTimeseriesView";
import SpikeDensityPlotWidget from "./neurosift-lib/viewPlugins/Units/SpikeDensityPlot/SpikeDensityPlotWidget";
import DynamicTableView from "./neurosift-lib/viewPlugins/DynamicTable/DynamicTableView";
import ProvideNwbFile from "./neurosift-lib/misc/ProvideNwbFile";

type SessionViewProps = {
  session: {
    session_path: string;
    nwb_url: string;
    multiscale_spike_density: { status: string; output_url: string };
    rastermap: { status: string; output_url: string };
  };
  width: number;
  useRastermap: boolean;
  showUnitsTables: boolean;
};

const SessionView: FunctionComponent<SessionViewProps> = ({
  session,
  width,
  useRastermap,
  showUnitsTables
}) => {
  const W = width - 50;
  const H_spike_density = 400;
  const H_face_motion = 150;
  const H_blink = 150;
  const H_eye_area = 150;
  const H_units_table = 300;

  const hasBehavior = session.session_path.includes("behavior");

  const rastermapOutput = useRastermapOutput(useRastermap ? session.rastermap.output_url : undefined);

  if (useRastermap && (!session.rastermap.output_url)) {
    return <div>Rastermap job not complete: {session.rastermap.status}</div>;
  }
  if (useRastermap && (!rastermapOutput)) {
    return <div>Loading rastermap output...</div>;
  }
  return (
    <SetupTimeseriesSelection>
      <ProvideNwbFile nwbUrl={session.nwb_url} dandisetId="000473">
        <div>Spike density</div>
        <IfHasBeenVisible width={W} height={H_spike_density}>
          <div
            style={{
              position: "relative",
              width: W,
              height: H_spike_density,
            }}
          >
            <SpikeDensityPlotWidget
              width={W}
              height={H_spike_density}
              multiscaleSpikeDensityOutputUrl={
                session.multiscale_spike_density.output_url
              }
              rastermapOutput={useRastermap ? rastermapOutput : undefined}
            />
          </div>
        </IfHasBeenVisible>

        {hasBehavior && (
          <>
            <div>Face motion</div>
            <IfHasBeenVisible width={W} height={H_face_motion}>
              <div
                style={{
                  position: "relative",
                  width: W,
                  height: H_face_motion,
                }}
              >
                <NwbTimeseriesView
                  width={W}
                  height={H_face_motion}
                  objectPath="/processing/behavior/BehavioralTimeSeries/face_motion_data"
                  colorChannels={true}
                />
              </div>
            </IfHasBeenVisible>

            <div>Blink</div>
            <IfHasBeenVisible width={W} height={H_blink}>
              <div
                style={{
                  position: "relative",
                  width: W,
                  height: H_blink,
                }}
              >
                <NwbTimeseriesView
                  width={W}
                  height={H_face_motion}
                  objectPath="/processing/behavior/Blink/blink"
                  colorChannels={true}
                />
              </div>
            </IfHasBeenVisible>

            <div>Eye area</div>
            <IfHasBeenVisible width={W} height={H_eye_area}>
              <div
                style={{
                  position: "relative",
                  width: W,
                  height: H_eye_area,
                }}
              >
                <NwbTimeseriesView
                  width={W}
                  height={H_face_motion}
                  objectPath="/processing/behavior/PupilTracking/eye_area"
                  colorChannels={true}
                />
              </div>
            </IfHasBeenVisible>
          </>
        )}
        {showUnitsTables && (
          <IfHasBeenVisible width={W} height={H_units_table}>
            <DynamicTableView
              width={W}
              height={H_units_table}
              path="/units"
              referenceColumnName="id"
            />
          </IfHasBeenVisible>
        )}
      </ProvideNwbFile>
    </SetupTimeseriesSelection>
  );
};

const useRastermapOutput = (rastermapUrl: string | undefined) => {
  const obj = useJsonObjectFromUrl(rastermapUrl);
  return obj;
};

const useJsonObjectFromUrl = (url: string | undefined) => {
  const [obj, setObj] = useState<any | null>(null);
  useEffect(() => {
    let canceled = false;
    if (!url) {
      setObj(null);
      return;
    }
    fetch(url)
      .then((resp) => resp.json())
      .then((val) => {
        if (canceled) return;
        setObj(val);
      });
    return () => {
      canceled = true;
    }
  }, [url]);
  return obj;
};

export default SessionView;
