/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWindowDimensions } from "@fi-sci/misc";
import "./App.css";
import mainMdTemplate from "./main.md?raw";
import Markdown from "./neurosift-lib/components/Markdown";
import sessions from "./sessions.json";

import nunjucks from "nunjucks";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SetupTimeseriesSelection } from "./neurosift-lib/contexts/context-timeseries-selection";
import { NwbFileContext } from "./neurosift-lib/misc/NwbFileContext";
import { tryGetLindiUrl } from "./neurosift-lib/pages/ChatPage/tools/timeseriesAlignmentView";
import {
  RemoteH5File,
  RemoteH5FileLindi,
} from "./neurosift-lib/remote-h5-file";
import IfHasBeenVisible from "./neurosift-lib/viewPlugins/PSTH/IfHasBeenVisible";
import NwbTimeseriesView from "./neurosift-lib/viewPlugins/TimeSeries/TimeseriesItemView/NwbTimeseriesView";
import SpikeDensityPlotWidget from "./neurosift-lib/viewPlugins/Units/SpikeDensityPlot/SpikeDensityPlotWidget";

nunjucks.configure({ autoescape: false });

const mainMd = nunjucks.renderString(mainMdTemplate, { sessions });

function App() {
  const { width, height } = useWindowDimensions();
  const mainAreaWidth = Math.min(width - 30, 1200);
  const offsetLeft = (width - mainAreaWidth) / 2;
  const divHandler = useMemo(() => getDivHandler(mainAreaWidth), [mainAreaWidth]);
  const onSpecialLinkClick = useMemo(() => (link: string) => {
    const r = parseSpecialLink(link);
    if (!r) return;
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        left: offsetLeft,
        width: mainAreaWidth,
        top: 0,
        height: height,
        overflow: "auto",
      }}
    >
      <Markdown
        source={mainMd}
        onSpecialLinkClick={onSpecialLinkClick}
        linkTarget="_self"
        divHandler={divHandler}
      />
    </div>
  );
}

const getDivHandler =
  (width: number) =>
  (a: { className: string | undefined; props: any; children: any }) => {
    const { className, props, children } = a;
    if (className === "session") {
      const a = sessions.find((s) => s.session_path === props.session_path);
      if (!a) {
        return <div>SESSION NOT FOUND {props.session_path}</div>;
      }
      const hasBehavior = a.session_path.includes("behavior");
      if (a.multiscale_spike_density.status === "completed") {
        const W = width - 50;
        const H_spike_density = 400;
        const H_face_motion = 150;
        const H_blink = 150;
        const H_eye_area = 150;
        return (
          <SetupTimeseriesSelection>
            <ProvideNwbFile nwbUrl={a.nwb_url} dandisetId="000473">
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
                      a.multiscale_spike_density.output_url
                    }
                  />
                </div>
              </IfHasBeenVisible>

              {hasBehavior && <>
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
              </>}
            </ProvideNwbFile>
          </SetupTimeseriesSelection>
        );
      } else {
        return <div>Job status: {a.multiscale_spike_density.status}</div>;
      }
    } else {
      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    }
  };

const parseSpecialLink = (link: string) => {
  if (link === "?/p=dandi") {
    return { page: "dandi" };
  } else if (link === "?/p=chat") {
    return { page: "chat" };
  }
  return null;
};

type ProvideNwbFileProps = {
  nwbUrl: string;
  dandisetId: string;
};

const ProvideNwbFile: FunctionComponent<
  PropsWithChildren<ProvideNwbFileProps>
> = ({ nwbUrl, dandisetId, children }) => {
  const nwbFile = useNwbFileFromUrl(nwbUrl, dandisetId);
  const value = useMemo(() => {
    return {
      nwbFile,
      neurodataItems: [],
    };
  }, [nwbFile]);
  if (!nwbFile) {
    return <div>Loading NWB file...</div>;
  }
  return (
    <NwbFileContext.Provider value={value}>{children}</NwbFileContext.Provider>
  );
};

const useNwbFileFromUrl = (nwbUrl: string, dandisetId: string) => {
  const [nwbFile, setNwbFile] = useState<
    RemoteH5File | RemoteH5FileLindi | null
  >(null);
  useEffect(() => {
    getNwbFileFromUrl(nwbUrl, dandisetId).then((val) => {
      setNwbFile(val);
    });
  }, [nwbUrl, dandisetId]);
  return nwbFile;
};

const nwbFileFromUrlCache: { [key: string]: RemoteH5File | RemoteH5FileLindi } = {};

const getNwbFileFromUrl = async (nwbUrl: string, dandisetId: string) => {
  if (nwbFileFromUrlCache[nwbUrl]) {
    return nwbFileFromUrlCache[nwbUrl];
  }
  const lindiUrl = await tryGetLindiUrl(nwbUrl, dandisetId);
  let ret: RemoteH5File | RemoteH5FileLindi;
  if (lindiUrl) {
    ret = await RemoteH5FileLindi.create(lindiUrl);
  } else {
    ret = new RemoteH5File(nwbUrl, {});
  }
  nwbFileFromUrlCache[nwbUrl] = ret;
  return ret;
};

export default App;
