import React, { useState, useRef, useEffect } from 'react';
import { Viewer, Entity, Sun, ImageryLayer, CameraFlyTo, Globe, Scene, EllipseGraphics, PolylineGraphics, LabelGraphics } from 'resium';
import { Cartesian3, Ion, IonResource, Color, EllipsoidGeodesic, Cartographic, ImageMaterialProperty, Math, ScreenSpaceEventHandler, ScreenSpaceEventType, PolygonPipeline, UrlTemplateImageryProvider, LabelStyle, Rectangle } from 'cesium';
import PubSub, { publish } from 'pubsub-js'
import CesiumNavigation from 'cesium-navigation-es6';
import Box from '@mui/material/Box';
import h337 from 'heatmap.js'
import './Viewer.css'

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2RlMWJlZi0wNDc0LTRhOTAtYjNmYi1jYmNiZjRhMTY1ZTUiLCJpZCI6MTI3Mjg1LCJpYXQiOjE2Nzc5OTA3MDN9.YP86r9gy1eMVa87vABnYkwETSPWPJEqN9aQKXmQM2W8";
IonResource.fromAssetId(96188)

const CesiumViewer = (props) => {

    const myViewer = useRef();
    console.log(myViewer)
    const [flyToDest, setDest] = useState(Cartesian3.fromDegrees(103, 36, 5020000))
    const earthquakeData1 = props.earthquakeData
    const antiAliasing = props.antiAliasing
    const [circleCenter, setCenter] = useState(Cartesian3.fromDegrees(0, 0, 0))
    const [pickedCoord, setPickedCoord] = useState(false)
    const [showBuffer, setShowBuffer] = useState(false)
    const [isMeasuringDist, setIsMeasuringDist] = useState(false);
    const [isMeasuringArea, setIsMeasuringArea] = useState(false)
    const [downloadJSON, setDownload] = useState(false)
    const [visibleMag, setVisible] = useState(false)
    const [showPins, setShowPins] = useState(false)
    const [heatmapRadius, setRadius] = useState(20)
    const [generateHeatmap, setGenerate] = useState(false)
    const [removeHeatmap, setremoveHeatmap] = useState(false)
    const [generatedMap, setGeneratedMap] = useState()
    const [isGetFaultData, setIsGetFaultData] = useState(false)
    const [removeFaultData, setRemoveFaultData] = useState(false)
    const [faultLines, setFaultLines] = useState([])
    const [isGetVolcanoData, setIsGetVolcanoData] = useState(false)
    const [removeVolcanoData, setRemoveVolcanoData] = useState(false)
    const [volcanoes, setVolcanoes] = useState([])
    const [isGetBoundaryData, setIsGetBoundaryData] = useState(false)
    const [removeBoundaryData, setRemoveBoundaryData] = useState(false)
    const [isWidgetsLoad, setIsLoad] = useState(false)
    const [boundaries, setBoundaries] = useState([])
    const [bounds, setBounds] = useState({
        lonMin: 85,
        lonMax: 115,
        latMin: 20,
        latMax: 50
    })
    const [pinPoints, setPins] = useState({
        class: 'Unknown',
        id: 0,
        name: 'Unknown',
        lat: 0,
        lon: 0,
        dist: 0
    })

    var messageSubscription = function (msg, data) {
        switch (msg) {
            case 'FLY DEST':
                setDest(data)
                break;
            case 'PICK POINT':
                setPickedCoord(data)
                break;
            case 'SHOW BUFFER':
                setShowBuffer(data)
                break;
            case 'START MEASURE':
                setIsMeasuringDist(data)
                break;
            case 'START MEASURE AREA':
                setIsMeasuringArea(data)
                break;
            case 'DOWNLOAD':
                setDownload(data)
                break;
            case 'VISIBLE MAGNITUDE':
                setVisible(data)
                break;
            case 'SHOW NEW SHELTER':
                setPins(data)
                setShowPins(true)
                break;
            case 'SET SHOW PIN':
                setShowPins(false)
                break;
            case 'GENERATE HEATMAP':
                setGenerate(data)
                break;
            case 'REMOVE HEATMAP':
                setremoveHeatmap(data)
                break;
            case 'BOUNDS':
                setBounds(data)
                break;
            case 'GET FAULT DATA':
                setIsGetFaultData(data)
                break;
            case 'REMOVE FAULTS':
                setRemoveFaultData(data)
                break;
            case 'GET VOLCANO DATA':
                setIsGetVolcanoData(data)
                break;
            case 'REMOVE VOLCANO':
                setRemoveVolcanoData(data)
                break;
            case 'GET BOUNDARY DATA':
                setIsGetBoundaryData(data)
                break;
            case 'REMOVE BOUNDARIES':
                setRemoveBoundaryData(data)
                break;
            case 'HEATMAP RADIUS':
                setRadius(data)
                break;
            default:
                break;
        }
    }
    PubSub.subscribe('FLY DEST', messageSubscription);
    PubSub.subscribe('PICK POINT', messageSubscription);
    PubSub.subscribe('SHOW BUFFER', messageSubscription);
    PubSub.subscribe('START MEASURE', messageSubscription);
    PubSub.subscribe('START MEASURE AREA', messageSubscription);
    PubSub.subscribe('DOWNLOAD', messageSubscription);
    PubSub.subscribe('VISIBLE MAGNITUDE', messageSubscription);
    PubSub.subscribe('SHOW NEW SHELTER', messageSubscription);
    PubSub.subscribe('SET SHOW PIN', messageSubscription);
    PubSub.subscribe('GENERATE HEATMAP', messageSubscription);
    PubSub.subscribe('REMOVE HEATMAP', messageSubscription);
    PubSub.subscribe('BOUNDS', messageSubscription);
    PubSub.subscribe('GET FAULT DATA', messageSubscription);
    PubSub.subscribe('REMOVE FAULTS', messageSubscription);
    PubSub.subscribe('GET VOLCANO DATA', messageSubscription);
    PubSub.subscribe('REMOVE VOLCANO', messageSubscription)
    PubSub.subscribe('GET BOUNDARY DATA', messageSubscription);
    PubSub.subscribe('REMOVE BOUNDARIES', messageSubscription)
    PubSub.subscribe('HEATMAP RADIUS', messageSubscription);
    PubSub.subscribe('SHOW WIDGETS', messageSubscription);

    useEffect(() => {

    }, []);

    const widgetControl = () => {
        if (myViewer.current && isWidgetsLoad == false) {
            const viewer = myViewer.current.cesiumElement
            var options = {};
            options.defaultResetView = Rectangle.fromDegrees(80, 20, 135, 52);
            // Only the compass will show on the map
            options.enableCompass = true;
            options.enableZoomControls = true;
            options.enableDistanceLegend = true;
            options.enableCompassOuterRing = true;
            new CesiumNavigation(viewer, options)
            setIsLoad(true)
        }
    }

    const getDistance = (start, end) => {
        var geodesic = new EllipsoidGeodesic();
        geodesic.setEndPoints(start, end);
        var distance = geodesic.surfaceDistance
        distance = (distance / 1000).toFixed(2)
        return distance
    }

    const handlePickCoordinate = () => {
        if (pickedCoord == true) {
            const viewer = myViewer.current.cesiumElement;
            const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction(function (evt) {
                var cartesian = viewer.camera.pickEllipsoid(evt.position, viewer.scene.globe.ellipsoid);
                var cartographic = Cartographic.fromCartesian(cartesian);
                var lng = Math.toDegrees(cartographic.longitude);//经度值
                var lat = Math.toDegrees(cartographic.latitude);//纬度值
                var mapPosition = { x: lng, y: lat, z: cartographic.height };//cartographic.height的值始终为零。
                PubSub.publish('PICKED COORD', 'X:' + mapPosition.x.toFixed(5) + ' ' + 'Y:' + mapPosition.y.toFixed(5))
                handler.destroy();
                setPickedCoord(false)
            }, ScreenSpaceEventType.LEFT_CLICK);
        }
    };

    const handleStartMeasureDist = () => {
        var measuringPoints = []
        var placedPoints = []
        var placedLines = []
        var distance = 0
        if (isMeasuringDist == true) {
            const viewer = myViewer.current.cesiumElement;
            const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction((evt) => {
                const cartesian = viewer.camera.pickEllipsoid(evt.position, viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    const cartographic = Cartographic.fromCartesian(cartesian);
                    const mapPosition = new Cartesian3.fromDegrees(Math.toDegrees(cartographic.longitude), Math.toDegrees(cartographic.latitude), cartographic.height);
                    measuringPoints.push(mapPosition);

                    const pointEntity = viewer.entities.add({
                        name: 'Point @' + cartographic.longitude + ',' + cartographic.latitude,
                        position: mapPosition,
                        point: {
                            pixelSize: 8,
                            color: Color.RED,
                            outlineColor: Color.WHITE,
                            outlineWidth: 2,
                            pickable: true,
                        },
                        pickable: true,
                    });

                    placedPoints.push(pointEntity)

                    if (measuringPoints.length >= 2) {
                        const geodesic = new EllipsoidGeodesic()
                        geodesic.setEndPoints(
                            Cartographic.fromCartesian(measuringPoints[measuringPoints.length - 2]),
                            Cartographic.fromCartesian(measuringPoints[measuringPoints.length - 1])
                        );
                        var polyline = viewer.entities.add({
                            polyline: {
                                positions: [(measuringPoints[measuringPoints.length - 2]), measuringPoints[measuringPoints.length - 1]],
                                width: 3,
                                material: Color.RED
                            }
                        })
                        placedLines.push(polyline)
                        const segmentDistance = geodesic.surfaceDistance / 1000; // Convert to kilometers
                        distance = distance + segmentDistance
                        PubSub.publish('DIST', distance.toFixed(2))
                    }
                }
            }, ScreenSpaceEventType.LEFT_CLICK);

            handler.setInputAction(() => {
                placedPoints.forEach((pointEntity) => {
                    viewer.entities.remove(pointEntity);
                });
                placedLines.forEach((polyline) => {
                    viewer.entities.remove(polyline);
                });
                measuringPoints = []
                distance = 0
                handler.destroy();
                setIsMeasuringDist(false);
            }, ScreenSpaceEventType.RIGHT_CLICK);
        }
    };

    const handleStartMeasureArea = () => {
        var measuringPoints = []
        var polygonPoints = []
        var createdPolygon = null
        if (isMeasuringArea == true) {
            const viewer = myViewer.current.cesiumElement;
            const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction((evt) => {
                const cartesian = viewer.camera.pickEllipsoid(evt.position, viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    const cartographic = Cartographic.fromCartesian(cartesian);
                    const mapPosition = new Cartesian3.fromDegrees(Math.toDegrees(cartographic.longitude), Math.toDegrees(cartographic.latitude), cartographic.height);
                    measuringPoints.push(mapPosition);

                    var pointEntity = viewer.entities.add({
                        name: 'Point @' + cartographic.longitude + ',' + cartographic.latitude,
                        position: mapPosition,
                        point: {
                            pixelSize: 8,
                            color: Color.YELLOW,
                            outlineColor: Color.WHITE,
                            outlineWidth: 2
                        }
                    })

                    polygonPoints.push(pointEntity)
                    if (createdPolygon) {
                        viewer.entities.remove(createdPolygon)
                    }
                    if (measuringPoints.length >= 3) {

                        var polygonEntity = viewer.entities.add({
                            polygon: {
                                hierarchy: measuringPoints,
                                material: Color.GREEN.withAlpha(0.2)
                            }
                        })
                        const polygonArea = PolygonPipeline.computeArea2D(measuringPoints, 0, measuringPoints.length);
                        publish('POLYGON AREA', polygonArea.toFixed(4)*2*1.23)
                        createdPolygon = polygonEntity
                    }
                }
            }, ScreenSpaceEventType.LEFT_CLICK);

            handler.setInputAction(() => {
                polygonPoints.forEach((pointEntity) => {
                    viewer.entities.remove(pointEntity);
                });
                viewer.entities.remove(createdPolygon);
                measuringPoints = []
                handler.destroy();
                setIsMeasuringArea(false);
            }, ScreenSpaceEventType.RIGHT_CLICK);
        }
    };
    const downloadGeoJSON = () => {
        if (downloadJSON == true) {
            const geoJson = {
                type: "FeatureCollection",
                features: earthquakeData1.map((earthquake) => ({
                    type: "Feature",
                    properties: {
                        depth: earthquake.depth,
                        magnitude: earthquake.magnitude,
                        place: earthquake.place,
                        region: earthquake.region,
                        time: earthquake.time
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [earthquake.longitude, earthquake.latitude]
                    }
                }))
            };
            const geoJsonString = JSON.stringify(geoJson, null, 2);
            const blob = new Blob([geoJsonString], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "地震数据.json";
            a.click();
            window.URL.revokeObjectURL(url);
            setDownload(false)
        }
    }

    const generateHeatMap = () => {
        if (generateHeatmap == true && removeHeatmap == false) {
            const viewer = myViewer.current.cesiumElement;

            let width = 600;
            let height = 600;

            // 定义平移量
            let translateX = 0;
            let translateY = 0;

            const heatmapData = earthquakeData1.map((earthquake) => ({
                x: (earthquake.latitude - bounds.latMin) / (bounds.latMax - bounds.latMin) * width + translateX,
                y: (earthquake.longitude - bounds.lonMin) / (bounds.lonMax - bounds.lonMin) * height + translateY,
                value: earthquake.magnitude, // 根据地震的强度或其他属性设置值
            }));
            const rotatedHeatmapData = heatmapData.map((dataPoint) => ({
                x: dataPoint.y, // 交换 x 和 y 值
                y: width - dataPoint.x, // 逆时针旋转90度
                value: dataPoint.value,
                radius: heatmapRadius
            }));
            let heatMapInstance = h337.create({
                container: document.querySelector('#heatMap'),
                maxOpacity: 0.5
            })

            let data = { max: 9, min: 0, data: rotatedHeatmapData }
            heatMapInstance.setData(data)
            let heatmapMaterial = new ImageMaterialProperty({
                image: heatMapInstance.getDataURL(),
                transparent: true,
                radius: '1px'

            });
            var result = viewer.entities.add({
                name: 'heatmap',
                // 设置矩形
                rectangle: {
                    // 指定矩形区域
                    coordinates: Rectangle.fromDegrees(bounds.lonMin, bounds.latMin, bounds.lonMax, bounds.latMax),
                    // 设置矩形材料为热力图材料
                    material: heatmapMaterial
                }
            });
            setGeneratedMap(result)
            setGenerate(false)
        } else if (removeHeatmap == true && generateHeatmap == false) {
            const viewer = myViewer.current.cesiumElement;
            viewer.entities.remove(generatedMap)
            setremoveHeatmap(false)
        }
    };

    const getFaultfromdb = async () => {
        if (isGetFaultData == true && removeFaultData == false) {
            const viewer = myViewer.current.cesiumElement;
            var lines = []
            const res = await fetch('http://10.2.148.244:8080/api/fault', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
            })
            const { data } = await res.json();
            data.map((fault) => {
                var flt = viewer.entities.add({
                    polyline: {
                        name: fault.fault_type,
                        positions: Cartesian3.fromDegreesArray(fault.point_array),
                        width: 1,
                        material: fault.fault_type == '活动断层' ? Color.RED : fault.fault_type == '第四纪断裂' ? Color.BLUE : fault.fault_type == '隐伏断裂' ? Color.YELLOWGREEN : fault.fault_type == '青藏高原' ? Color.PURPLE : Color.YELLOW
                    }
                })
                lines.push(flt)
            })
            setFaultLines(lines)
            setIsGetFaultData(false)
        } else if (removeFaultData == true && isGetFaultData == false) {
            const viewer = myViewer.current.cesiumElement;
            faultLines.forEach((fault) => {
                viewer.entities.remove(fault)
            })
            setRemoveFaultData(false)
        }

    }

    const getVolcanoesfromdb = async () => {
        if (isGetVolcanoData == true && removeVolcanoData == false) {
            const viewer = myViewer.current.cesiumElement;
            var temp = []
            const res = await fetch('http://10.2.148.244:8080/api/volcanoes', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
            })
            const { data } = await res.json();
            console.log(data)
            data.map((volcano) => {
                if (parseFloat(volcano.alt) > 0) {
                    var coneEntity = viewer.entities.add({
                        name: volcano.vol_name + ', ' + volcano.voc_reg,
                        position: Cartesian3.fromDegrees(parseFloat(volcano.lon), parseFloat(volcano.lat)), // 设置位置
                        description: `火山类别：${volcano.pri_voc_type}` + '<div></div>' + `火山时代：${volcano.voc_time}` + '<div></div>' + `火山海拔：${volcano.alt}m`,
                        cylinder: {
                            length: volcano.alt * 10, // 圆锥体的长度
                            topRadius: volcano.alt * 2,   // 顶部半径，0表示尖锥
                            bottomRadius: volcano.alt * 10, // 底部半径
                            material: Color.PURPLE, // 圆锥体的颜色
                            outline: false, // 是否显示轮廓线
                            outlineColor: Color.BLACK, // 轮廓线颜色

                        },
                    });
                    temp.push(coneEntity)
                } else {
                    var pointEntity = viewer.entities.add({
                        name: volcano.vol_name,
                        position: Cartesian3.fromDegrees(parseFloat(volcano.lon), parseFloat(volcano.lat)),
                        description: `火山类别：${volcano.pri_voc_type}` + '<div></div>' + `火山时代：${volcano.voc_time}` + '<div></div>' + `火山海拔：${volcano.alt}m`,
                        point: {
                            pixelSize: 4,
                            color: Color.GREEN,
                            outlineColor: Color.WHITE,
                            outlineWidth: 1
                        }
                    })
                    temp.push(pointEntity)
                }
            })
            setVolcanoes(temp)
            setIsGetVolcanoData(false)
        } else if (removeVolcanoData == true && isGetVolcanoData == false) {
            const viewer = myViewer.current.cesiumElement;
            volcanoes.forEach((volcano) => {
                viewer.entities.remove(volcano)
            })
            setRemoveVolcanoData(false)
        }
    }

    const getBoundaryfromdb = async () => {
        if (isGetBoundaryData == true && removeBoundaryData == false) {
            const viewer = myViewer.current.cesiumElement;
            var lines = []
            const res = await fetch('http://10.2.148.244:8080/api/boundary', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
            })
            const { data } = await res.json();
            data.map((boundary) => {
                var bound = viewer.entities.add({
                    polyline: {
                        name: boundary.border,
                        positions: Cartesian3.fromDegreesArray(boundary.point_array),
                        width: 1,
                        material: Color.ORANGERED
                    }
                })
                lines.push(bound)
            })
            setBoundaries(lines)
            setIsGetBoundaryData(false)
        } else if (removeBoundaryData == true && isGetBoundaryData == false) {
            const viewer = myViewer.current.cesiumElement;
            boundaries.forEach((boundary) => {
                viewer.entities.remove(boundary)
            })
            setRemoveBoundaryData(false)
        }
    }

    //功能实现区
    handlePickCoordinate()
    handleStartMeasureDist()
    handleStartMeasureArea()
    downloadGeoJSON()
    generateHeatMap()
    getFaultfromdb()
    getVolcanoesfromdb()
    getBoundaryfromdb()
    widgetControl()

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Viewer

                id='viewer'
                full
                timeline={false}  // Disable timeline
                animation={false} // Disable animation
                ref={myViewer}
                resolutionScale={antiAliasing}
                homeButton={false}
            >
                <div id='heatMap' style={{ width: '600px', height: '600px' }}></div>
                <Globe enableLighting={props.globalLight}></Globe>
                <Scene debugShowFramesPerSecond={props.showFps}></Scene>
                <Sun show={true} />
                <CameraFlyTo destination={flyToDest}></CameraFlyTo>
                <ImageryLayer
                    imageryProvider={new UrlTemplateImageryProvider({
                        url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=2&style=8",
                        layer: "tdtAnnoLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                        maximumLevel: 12
                    })}
                >
                </ImageryLayer>

                {/* Add a point entity with color */}
                {earthquakeData1.map((earthquake, index) => (
                    <Entity
                        key={index}
                        name={`${earthquake.place} M${earthquake.magnitude}`}
                        position={Cartesian3.fromDegrees(parseFloat(earthquake.longitude), parseFloat(earthquake.latitude), 0)}
                        point={{
                            pixelSize: earthquake.magnitude < props.magVal ? 5 : 8,
                            color: earthquake.magnitude < props.magVal ? Color.YELLOW : Color.RED
                        }}
                        description={`震级${earthquake.magnitude}级<div style="width:20px;height:0px;text-align:center;padding:0px"></div>
                        发震时间：${new Date(earthquake.time).toLocaleString()}<div style="width:20px;height:0px;text-align:center;padding:0px"></div>
                        距您${getDistance(Cartographic.fromDegrees(earthquake.longitude, earthquake.latitude), Cartographic.fromDegrees(props.longitude, props.latitude))}km`
                        }
                        onClick={(moment, entity) => { setCenter(entity.primitive._actualPosition) }}
                    />
                ))}
                {earthquakeData1.map((earthquake, index) => {
                    return (
                        <Entity
                            key={index}
                            name={`${earthquake.place} M${earthquake.magnitude}`}
                            show={visibleMag}
                        >
                            <PolylineGraphics
                                positions={Cartesian3.fromDegreesArrayHeights([parseFloat(earthquake.longitude), parseFloat(earthquake.latitude), 0, parseFloat(earthquake.longitude), parseFloat(earthquake.latitude), (parseFloat(earthquake.magnitude) ** 3) * 50000])}
                                width={2}
                            />
                        </Entity>
                    )
                })}

                <Entity
                    key={3}
                    name={pinPoints.name}
                    show={showPins}
                    position={Cartesian3.fromDegrees(pinPoints.lon, pinPoints.lat)}
                >
                    <LabelGraphics
                        text={pinPoints.name}
                        font="16px Helvetica"
                        fillColor={Color.SKYBLUE}
                        outlineColor={Color.BLACK}
                        outlineWidth={1}
                        style={LabelStyle.FILL_AND_OUTLINE}
                    />
                </Entity>

                <Entity position={circleCenter} show={showBuffer}>
                    {/* 以 center 为圆心绘制不同半径的同心圆 */}
                    <EllipseGraphics
                        semiMinorAxis={50000} // 50km
                        semiMajorAxis={50000} // 50km
                        height={0}
                        material={Color.RED.withAlpha(0.6)}
                    />
                </Entity>
                <Entity position={circleCenter} show={showBuffer}>
                    {/* 以 center 为圆心绘制不同半径的同心圆 */}
                    <EllipseGraphics
                        semiMinorAxis={100000} // 50km
                        semiMajorAxis={100000} // 50km
                        height={0}
                        material={Color.ORANGE.withAlpha(0.5)}
                    />
                </Entity>
                <Entity position={circleCenter} show={showBuffer}>
                    {/* 以 center 为圆心绘制不同半径的同心圆 */}
                    <EllipseGraphics
                        semiMinorAxis={200000} // 50km
                        semiMajorAxis={200000} // 50km
                        height={0}
                        material={Color.YELLOW.withAlpha(0.4)}
                    />
                </Entity>
                <Entity position={circleCenter} show={showBuffer}>
                    {/* 以 center 为圆心绘制不同半径的同心圆 */}
                    <EllipseGraphics
                        semiMinorAxis={300000} // 50km
                        semiMajorAxis={300000} // 50km
                        height={0}
                        material={Color.BLUE.withAlpha(0.3)}
                    />
                </Entity>
                <Entity position={circleCenter} show={showBuffer}>
                    {/* 以 center 为圆心绘制不同半径的同心圆 */}
                    <EllipseGraphics
                        semiMinorAxis={500000} // 50km
                        semiMajorAxis={500000} // 50km
                        height={0}
                        material={Color.SKYBLUE.withAlpha(0.2)}
                    />
                </Entity>
                <Entity
                    name="您的位置"
                    position={Cartesian3.fromDegrees(props.longitude, props.latitude, 0)} // Example coordinates
                    point={{ pixelSize: 10, color: Color.BLUE }}
                />
            </Viewer>
        </Box>
    );
};

export default CesiumViewer;
