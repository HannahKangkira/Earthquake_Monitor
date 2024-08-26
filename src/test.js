import React, { useRef, useState } from 'react';
import { Viewer, Cartesian3, ScreenSpaceEventType, ScreenSpaceEventHandler, Cartographic, Color, PolylineGraphics } from 'cesium';
import { Viewer as ResiumViewer, Entity } from 'resium';

const CesiumComponent = () => {
    const myViewer = useRef();
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [measuringPoints, setMeasuringPoints] = useState([]);
    const [distance, setDistance] = useState(0);

    const handleStartMeasure = () => {
        setIsMeasuring(true);
        setMeasuringPoints([]);
        setDistance(0);

        const viewer = myViewer.current.cesiumElement;
        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((evt) => {
            const cartesian = viewer.camera.pickEllipsoid(evt.position, viewer.scene.globe.ellipsoid);
            if (cartesian) {
                const cartographic = Cartographic.fromCartesian(cartesian);
                const lng = Math.toDegrees(cartographic.longitude);
                const lat = Math.toDegrees(cartographic.latitude);
                const mapPosition = new Cartesian3.fromDegrees(lng, lat, cartographic.height);

                setPoints((prevPoints) => [...prevPoints, mapPosition]);

                if (measuringPoints.length >= 2) {
                    const geodesic = new EllipsoidGeodesic();
                    geodesic.setEndPoints(
                        Cartographic.fromCartesian(measuringPoints[measuringPoints.length - 2]),
                        Cartographic.fromCartesian(measuringPoints[measuringPoints.length - 1])
                    );
                    const segmentDistance = geodesic.surfaceDistance / 1000; // Convert to kilometers
                    setDistance((prevDistance) => prevDistance + segmentDistance);
                    console.log(distance)
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(() => {
            handler.destroy();
            setIsMeasuring(false);
        }, ScreenSpaceEventType.RIGHT_CLICK);
    };

    return (
        <div>
            <ResiumViewer ref={myViewer} full>
                <Viewer id="viewer" full>
                    {/* Your other Cesium components here */}
                </Viewer>
            </ResiumViewer>
            <button onClick={handleStartMeasure}>{isMeasuring ? 'Stop Measuring' : 'Start Measuring'}</button>
            {isMeasuring && <p>Distance: {distance.toFixed(2)} km</p>}
        </div>
    );
};

export default CesiumComponent;
