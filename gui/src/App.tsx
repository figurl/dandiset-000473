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
import DynamicTableView from "./neurosift-lib/viewPlugins/DynamicTable/DynamicTableView";

nunjucks.configure({ autoescape: false });

const mainMd = nunjucks.renderString(mainMdTemplate, { sessions });

function App() {
  const { width, height } = useWindowDimensions();
  const mainAreaWidth = Math.min(width - 30, 1200);
  const offsetLeft = (width - mainAreaWidth) / 2;
  const [useRastermap, setUseRastermap] = useState(true);
  const [showUnitsTables, setShowUnitsTables] = useState(true);
  const divHandler = useMemo(() => (
    (a: { className: string | undefined; props: any; children: any }) => {
      const { className, props, children } = a;
      if (className === "session") {
        const session = sessions.find(
          (s) => s.session_path === props.session_path
        );
        if (!session) {
          return <div>SESSION NOT FOUND {props.session_path}</div>;
        }
        if (session.multiscale_spike_density.status === "completed") {
          return <SessionView session={session} width={mainAreaWidth} useRastermap={useRastermap} showUnitsTables={showUnitsTables} />;
        } else {
          return <div>Job status: {session.multiscale_spike_density.status}</div>;
        }
      } else if (className === "use-rastermap-selector") {
        return (
          <UseRastermapSelector
            useRastermap={useRastermap}
            setUseRastermap={setUseRastermap}
          />
        )
      } else if (className === "show-units-tables-selector") {
        return (
          <ShowUnitsTablesSelector
            showUnitsTables={showUnitsTables}
            setShowUnitsTables={setShowUnitsTables}
          />
        );
      }
      else {
        return (
          <div className={className} {...props}>
            {children}
          </div>
        );
      }
    }
  ), [useRastermap, mainAreaWidth, showUnitsTables]);
  const onSpecialLinkClick = useMemo(
    () => (link: string) => {
      const r = parseSpecialLink(link);
      if (!r) return;
    },
    []
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        top: 0,
        height: height,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetLeft,
          width: mainAreaWidth,
          top: 0
        }}
      >
        <Markdown
          source={mainMd}
          onSpecialLinkClick={onSpecialLinkClick}
          linkTarget="_self"
          divHandler={divHandler}
        />
      </div>
    </div>
  );
}

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

const nwbFileFromUrlCache: { [key: string]: RemoteH5File | RemoteH5FileLindi } =
  {};

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

type UseRastermapSelectorProps = {
  useRastermap: boolean;
  setUseRastermap: (val: boolean) => void;
};

const UseRastermapSelector: FunctionComponent<UseRastermapSelectorProps> = ({
  useRastermap,
  setUseRastermap
}) => {
  return (
    <span>
      <input
        type="checkbox"
        checked={useRastermap}
        onChange={(e) => setUseRastermap(e.target.checked)}
      />&nbsp;
      Use rastermap
    </span>
  );
};

type ShowUnitsTablesSelectorProps = {
  showUnitsTables: boolean;
  setShowUnitsTables: (val: boolean) => void;
};

const ShowUnitsTablesSelector: FunctionComponent<ShowUnitsTablesSelectorProps> = ({
  showUnitsTables,
  setShowUnitsTables
}) => {
  return (
    <span>
      <input
        type="checkbox"
        checked={showUnitsTables}
        onChange={(e) => setShowUnitsTables(e.target.checked)}
      />&nbsp;
      Show units tables
    </span>
  );
};

export default App;
