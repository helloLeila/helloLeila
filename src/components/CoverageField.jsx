// 当前工作地模块，使用 L7 + Three 的三维地图场景承载深圳工作地表达。
import { useEffect, useRef, useState } from "react";
import { siteContent } from "../data/siteContent.js";
import { textByLang } from "../utils/i18n.js";
import { getClockEntries } from "../utils/timezones.js";
import { WeatherTrendChart } from "./WeatherTrendChart.jsx";
import gcoord from "gcoord";

// 深圳作为主锚点，整个场景围绕粤港澳大湾区展开。
const shenzhenHub = {
  name: "深圳",
  lng: 114.0579,
  lat: 22.5431,
};

// 大湾区机场与交通节点
const airPorts = [
  { name: "深圳宝安国际机场", lng: 113.8107, lat: 22.6393 },
  { name: "广州白云国际机场", lng: 113.308, lat: 23.3924 },
  { name: "香港国际机场", lng: 113.9185, lat: 22.308 },
  { name: "澳门国际机场", lng: 113.5917, lat: 22.1496 },
  { name: "珠海金湾机场", lng: 113.3768, lat: 22.0064 },
  { name: "惠州平潭机场", lng: 114.6036, lat: 23.0495 },
];

// 航线统一回收到深圳主锚点
const planeTarget = {
  lng2: shenzhenHub.lng,
  lat2: shenzhenHub.lat,
};
const airLineData = airPorts.map((item) => ({
  ...item,
  ...planeTarget,
}));

// 大湾区柱体与波纹数据
const pointData = [
  { name: "深圳", lng: 114.0579, lat: 22.5431, size: 86000 },
  { name: "南山区", lng: 113.9304, lat: 22.5333, size: 28000 },
  { name: "宝安区", lng: 113.8838, lat: 22.5545, size: 30000 },
  { name: "广州", lng: 113.2644, lat: 23.1291, size: 64000 },
  { name: "东莞", lng: 113.7518, lat: 23.0207, size: 52000 },
  { name: "香港", lng: 114.1694, lat: 22.3193, size: 54000 },
  { name: "佛山", lng: 113.1214, lat: 23.0215, size: 41000 },
  { name: "珠海", lng: 113.5767, lat: 22.2707, size: 36000 },
  { name: "中山", lng: 113.3824, lat: 22.5211, size: 32000 },
  { name: "惠州", lng: 114.4168, lat: 23.1115, size: 30000 },
  { name: "澳门", lng: 113.5439, lat: 22.1987, size: 26000 },
  { name: "江门", lng: 113.0815, lat: 22.5787, size: 24000 },
  { name: "肇庆", lng: 112.4651, lat: 23.0472, size: 20000 },
];

// 城市标注
const bayAreaLabels = pointData
  .filter(({ name }) => !["南山区", "宝安区"].includes(name))
  .map(({ name, lng, lat }) => ({ name, lng, lat }));

const shenzhenDistrictLabels = pointData
  .filter(({ name }) => ["南山区", "宝安区"].includes(name))
  .map(({ name, lng, lat }) => ({
    name,
    lng,
    lat,
    textOffset: name === "南山区" ? [-92, -12] : [-78, 24],
    textAnchor: name === "南山区" ? "right" : "top-right",
  }));

// 地图边界
const bayAreaBounds = {
  minLng: 112.2,
  maxLng: 114.85,
  minLat: 21.85,
  maxLat: 23.65,
};

// 边界围墙数据
function createBayAreaWallData(bounds) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "大湾区边界" },
        geometry: {
          type: "LineString",
          coordinates: [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat],
            [bounds.minLng, bounds.maxLat],
            [bounds.minLng, bounds.minLat],
          ],
        },
      },
    ],
  };
}

// 模型材质
function setMaterial(object) {
  if (object.children && object.children.length > 0) {
    object.children.forEach((child) => setMaterial(child));
    return;
  }
  if (object.material) {
    object.material.wireframe = true;
    object.material.opacity = 0.6;
    object.material.transparent = true;
  }
}

// 网格高度计算
function getBayAreaHeight(lng, lat) {
  let peak = 0;
  for (const point of pointData) {
    const dx = lng - point.lng;
    const dy = lat - point.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const influence = Math.max(0, 1 - distance / 0.7) * (point.size / 86000);
    peak = Math.max(peak, influence);
  }
  return 0.12 + peak * 0.8;
}

// 网格数据
function createGridGeoData(bounds, columns = 20, rows = 14) {
  const verticalLines = [];
  const horizontalLines = [];
  const lngStep = (bounds.maxLng - bounds.minLng) / (columns - 1);
  const latStep = (bounds.maxLat - bounds.minLat) / (rows - 1);

  for (let xIndex = 0; xIndex < columns; xIndex += 1) {
    const line = [];
    const lng = bounds.minLng + lngStep * xIndex;
    for (let yIndex = 0; yIndex < rows; yIndex += 1) {
      const lat = bounds.maxLat - latStep * yIndex;
      line.push([lng, lat, getBayAreaHeight(lng, lat)]);
    }
    verticalLines.push(line);
  }

  for (let yIndex = 0; yIndex < rows; yIndex += 1) {
    const line = [];
    const lat = bounds.maxLat - latStep * yIndex;
    for (let xIndex = 0; xIndex < columns; xIndex += 1) {
      const lng = bounds.minLng + lngStep * xIndex;
      line.push([lng, lat, getBayAreaHeight(lng, lat)]);
    }
    horizontalLines.push(line);
  }

  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: verticalLines } },
      { type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: horizontalLines } },
    ],
  };
}

// 时间格式化
function formatUpdatedAt(updatedAt, lang) {
  if (!updatedAt) return lang === "zh" ? "等待刷新" : "Pending";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return updatedAt;
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Shanghai",
  }).format(date);
}

// 温度格式化
function formatTemperature(value) {
  if (typeof value !== "number") return value ?? "--";
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

// 核心组件
export function CoverageField({ lang, weather }) {
  const mapRef = useRef(null);
  const sceneRef = useRef(null);
  const [sceneStatus, setSceneStatus] = useState("idle");
  const [sceneError, setSceneError] = useState("");
  const [clockNow, setClockNow] = useState(() => new Date());
  const title = textByLang(lang, siteContent.coverage.titleEn, siteContent.coverage.titleZh);
  const weatherTitle = textByLang(lang, "Shenzhen weather", "深圳天气");
  const weatherKicker = textByLang(lang, "Daily forecast", "每日天气");
  const forecast = weather?.daily || [];
  const updatedAt = formatUpdatedAt(weather?.updatedAt, lang);
  const todayMorning = forecast[0]?.morningTemperature ?? "--";
  const todayEvening = forecast[0]?.eveningTemperature ?? "--";
  const todaySwing = forecast[0]?.swing ?? "--";
  const clocks = getClockEntries(lang, clockNow);
  const summaryNotes = siteContent.coverage.mapNotes.map((item) =>
    item.key === "typhoonEta"
      ? { ...item, valueEn: weather?.typhoonEta?.en || item.valueEn, valueZh: weather?.typhoonEta?.zh || item.valueZh }
      : item
  );
  const statusText = sceneStatus === "error"
    ? textByLang(lang, "Scene unavailable", "场景加载失败")
    : textByLang(lang, "Current base", "当前主要阵地");

  // 默认地图视角
  const DEFAULT_VIEW = {
    center: [114.0579, 22.5431],
    zoom: 8.1,
    pitch: 68,
    rotation: 0,
  };

  // 时钟定时器
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // 地图初始化
  useEffect(() => {
    if (!mapRef.current) return undefined;
    let isActive = true;
    let scene;

    async function mountScene() {
      setSceneStatus("mounting");
      setSceneError("");

      const [
        { LineLayer, PointLayer, Scene, Zoom, GeoLocate, Control },
        { GaodeMap },
        { ThreeLayer, ThreeRender },
        THREE,
        { GLTFLoader },
      ] = await Promise.all([
        import("@antv/l7"),
        import("@antv/l7-maps"),
        import("@antv/l7-three"),
        import("@antv/l7-three/node_modules/three/build/three.module.js"),
        import("@antv/l7-three/node_modules/three/examples/jsm/loaders/GLTFLoader.js"),
      ]);
      THREE.ColorManagement.enabled = false;

      if (!isActive || !mapRef.current) return;

      const planeUrl = "https://gw.alipayobjects.com/zos/bmw-prod/96327aa6-7fc5-4b5b-b1d8-65771e05afd8.svg";
      const modelUrl = "https://gw.alipayobjects.com/os/bmw-prod/3ca0a546-92d8-4ba0-a89c-017c218d5bea.gltf";
      const gridGeoData = createGridGeoData(bayAreaBounds, 32, 22);
      const wallData = createBayAreaWallData(bayAreaBounds);

      // Three.js 模型图层
      const threeJSLayer = new ThreeLayer({
        enableMultiPassRenderer: false,
        onAddMeshes: (threeScene, layer) => {
          const ambientLight = new THREE.AmbientLight(0xffffff);
          const sunlight = new THREE.DirectionalLight(0xffffff, 0.25);
          sunlight.position.set(0, 800000, 1000000);
          sunlight.matrixWorldNeedsUpdate = true;
          threeScene.add(ambientLight);
          threeScene.add(sunlight);

          const loader = new GLTFLoader();
          loader.load(modelUrl, (gltf) => {
            if (!isActive) return;
            const antModel = gltf.scene;
            setMaterial(antModel);
            layer.adjustMeshToMap(antModel);
            layer.setMeshScale(antModel, 2000, 2000, 2000);
            layer.setObjectLngLat(antModel, [shenzhenHub.lng, shenzhenHub.lat], 0);

            if (gltf.animations?.length) {
              const mixer = new THREE.AnimationMixer(antModel);
              const action = mixer.clipAction(gltf.animations[1] || gltf.animations[0]);
              action.timeScale = 1;
              action.play();
              layer.addAnimateMixer(mixer);
            }

            antModel.rotation.y = Math.PI;
            threeScene.add(antModel);
            layer.render();
          });
        },
        zIndex: 1,
      });

      // 航线图层
      const airLineLayer = new LineLayer({ blend: "normal" })
        .source(airLineData, { parser: { type: "json", x: "lng", y: "lat", x1: "lng2", y1: "lat2" } })
        .shape("arc3d").size(1).color("#9aacd8")
        .style({ sourceColor: "rgba(154,172,216,0.58)", targetColor: "rgba(224,233,250,0.08)" });

      // 飞机动画
      const airPlaneLayer = new LineLayer({ blend: "normal", zIndex: 1 })
        .source(airLineData, { parser: { type: "json", x: "lng2", y: "lat2", x1: "lng", y1: "lat" } })
        .shape("arc3d").texture("plane").size(24).color("rgba(255,255,255,0.9)")
        .animate({ duration: 0.2, interval: 0.2, trailLength: 0.2 })
        .style({ textureBlend: "replace", lineTexture: true, iconStep: 6 });

      // 波纹/柱体/文字图层
      const waveLayer = new PointLayer({ zIndex: 2, blend: "additive" })
        .source(pointData, { parser: { type: "json", x: "lng", y: "lat" } })
        .shape("circle").color("#c9d9ff").size("size", (v) => v)
        .animate(true).style({ unit: "meter", opacity: 0.12 });

      const barLayer = new PointLayer({ zIndex: 2, depth: false })
        .source(pointData, { parser: { type: "json", x: "lng", y: "lat" } })
        .shape("cylinder").color("size", ["#f4f7ff", "#c8d9ff", "#8ba7eb"])
        .size("size", (v) => [5, 5, v / 350])
        .animate(true).style({ opacityLinear: { enable: true, dir: "up" }, lightEnable: false, opacity: 0.58 });

      const cityLabelLayer = new PointLayer({ zIndex: 3 })
        .source(bayAreaLabels, { parser: { type: "json", x: "lng", y: "lat" } })
        .shape("name", "text").color("#e4ebfb").size(14)
        .style({ stroke: "#8fa5d6", strokeWidth: 0.6 });

      const districtLabelLayer = new PointLayer({ zIndex: 4 })
        .source(shenzhenDistrictLabels, { parser: { type: "json", x: "lng", y: "lat" } })
        .shape("name", "text").color("#d8e3fb").size(15)
        .style({ textAllowOverlap: true, padding: [0, 0], stroke: "#869ccc", strokeWidth: 0.6 });

      const gridLayer = new LineLayer({})
        .source(gridGeoData).size(1).shape("simple").color("#c7d3eb")
        .style({ vertexHeightScale: 64000, opacity: 0.24 });

      const wallLayer = new LineLayer({ zIndex: 1 })
        .source(wallData).size(4600).shape("wall")
        .style({ opacity: 0.08, sourceColor: "#d7e2f8", targetColor: "rgba(255,255,255,0.01)" });

      // 初始化地图
      scene = new Scene({
        id: mapRef.current,
        logoVisible: false,
        map: new GaodeMap({
        center: [114.0579, 22.5431],
        pitch: 68,
        zoom: 8.1,
        rotation: 0,
        style: "blank",
        token: "f0d74a97768261e0fe8366b05b9adb6a", 
}),
      });

      sceneRef.current = scene;
      scene.setBgColor("#ffffff");
      scene.registerRenderService(ThreeRender);

      scene.on("loaded", () => {
        if (!isActive) return;
        
        // 原生控件
        const zoom = new Zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小" });
        const geoLocate = new GeoLocate({
          transform: (position) => gcoord.transform(position, gcoord.WGS84, gcoord.GCJ02),
        });

        // ✅ 修复：继承 L7 Control 基类，彻底解决 addTo 报错
        class ResetControl extends Control {
          onAdd() {
            const btn = document.createElement('button');
            btn.className = 'l7-control-zoom-in';
            btn.style.width = '28px';
            btn.style.height = '28px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.fontSize = '14px';
            btn.innerText = '⟲';
            btn.title = '返回默认视角';
            btn.onclick = () => {
              scene.setCenter(DEFAULT_VIEW.center);
              scene.setZoom(DEFAULT_VIEW.zoom);
              scene.setPitch(DEFAULT_VIEW.pitch);
              scene.setRotation(DEFAULT_VIEW.rotation);
            };
            return btn;
          }
        }
        const resetControl = new ResetControl({ position: 'topright' });

        // 添加控件
        scene.addControl(zoom);
        scene.addControl(geoLocate);
        scene.addControl(resetControl);

        try {
          scene.addImage("plane", planeUrl);
          scene.addLayer(gridLayer);
          scene.addLayer(wallLayer);
          scene.addLayer(airLineLayer);
          scene.addLayer(airPlaneLayer);
          scene.addLayer(waveLayer);
          scene.addLayer(barLayer);
          scene.addLayer(cityLabelLayer);
          scene.addLayer(districtLabelLayer);
          scene.addLayer(threeJSLayer);
          setSceneStatus("ready");
        } catch (error) {
          setSceneStatus("error");
          setSceneError(error.message);
        }
      });

      scene.on("error", (e) => {
        if (isActive) { setSceneStatus("error"); setSceneError(e.error?.message); }
      });
    }

    mountScene().catch((err) => {
      if (isActive) { setSceneStatus("error"); setSceneError(err.message); }
    });

    return () => {
      isActive = false;
      scene?.destroy();
    };
  }, []);

  return (
    <section className="coverage-card" aria-label={title}>
      <div className="coverage-layout">
        <div className="coverage-copy">
          <article className="weather-panel coverage-weather-card">
            <header className="section-head compact coverage-weather-head">
              <span className="section-kicker">{weatherKicker}</span>
            </header>

            <div className="weather-top">
              <div className="weather-city">
                <span>{weather?.city || siteContent.weather.city}</span>
                <span className="weather-badge">{weather?.condition || (lang === "zh" ? "实时更新" : "Live")}</span>
              </div>

              <div className="metric-row">
                <div className="metric-pill coverage-metric-emphasis">
                  <strong>{formatTemperature(todayMorning)}°C</strong>
                  <span>{lang === "zh" ? "早间温度" : "Morning temperature"}</span>
                </div>
                <div className="metric-pill coverage-metric-emphasis">
                  <strong>{formatTemperature(todayEvening)}°C</strong>
                  <span>{lang === "zh" ? "晚间温度" : "Evening temperature"}</span>
                </div>
                <div className="metric-pill">
                  <strong>{weather?.humidity ?? "--"}%</strong>
                  <span>{lang === "zh" ? "当前湿度" : "Current humidity"}</span>
                </div>
                <div className="metric-pill">
                  <strong>{formatTemperature(todaySwing)}°C</strong>
                  <span>{lang === "zh" ? "今日早晚温差" : "Today swing"}</span>
                </div>
              </div>

              <div className="tiny-chart coverage-weather-trend">
                {forecast.length > 0 ? <WeatherTrendChart data={forecast} lang={lang} /> : null}
              </div>
            </div>

            <footer className="weather-panel-footer">
              <span>{lang === "zh" ? "最近刷新" : "Last refresh"}</span>
              <strong>{updatedAt}</strong>
            </footer>

            <div className="time-panel coverage-clock-panel">
              {clocks.map((clock) => (
                <div className="time-entry" key={clock.key}>
                  <span>{clock.label}</span>
                  <strong>{clock.value}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="coverage-field" data-coverage-status={sceneStatus} data-coverage-error={sceneError}>
          <div className="coverage-grid" aria-hidden="true" />
          <div className="coverage-glow" aria-hidden="true" />
          <div className="coverage-chart" ref={mapRef} />
          <div className="coverage-status">{statusText}</div>

          <div className="coverage-summary-grid">
            {summaryNotes.map((item) => (
              <article className="coverage-note" key={item.labelEn}>
                <span>{textByLang(lang, item.labelEn, item.labelZh)}</span>
                <strong>{textByLang(lang, item.valueEn, item.valueZh)}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
