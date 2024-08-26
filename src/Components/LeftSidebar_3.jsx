// src/Components/Sidebar.js
import React, { useState } from 'react';
import { Drawer, Button, Radio, RadioGroup, FormControlLabel, FormLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, FormControl, FormGroup, Switch, Slider, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PubSub, { publish } from 'pubsub-js';
import Swal from 'sweetalert2';

const LeftSidebar_3 = (props) => {

    const [open, setOpen] = useState(false); // Initial state: open drawer
    const [getPositionOpen, setGetPositionOpen] = useState(false);
    const [getDataNotice, setGetDataNotice] = useState('')
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [myInterval, setMyInterval] = useState()
    var manualSetLong
    var manualSetLat

    const handleToggleDrawer = () => {
        setOpen((open) => !open); // Toggle drawer state
        sendData(open)
    }

    const handleGetPositionOpen = () => {
        setGetDataNotice('')
        setGetPositionOpen(true);
    };
    const handleGetPositionClose = () => {
        const lat = parseFloat(manualSetLat)
        const long = parseFloat(manualSetLong)

        if(!isNaN(lat) && !isNaN(long)){
            if (lat <= 90 && lat >= -90) {
                if (long <= 180 && long >= -180) {
                    publish('SET LAT', lat)
                    publish('SET LONG', long)
                    setGetPositionOpen(false);
                } else {
                    setGetDataNotice('经度输入错误，请重新输入')
                }
            } else {
                setGetDataNotice('纬度输入错误，请重新输入')
            }
        }else {
            setGetDataNotice('数据输入错误，请重新输入')
        }
       
    };

    const sendData = (value) => {
        props.getValuefrombar(value)
    }

    const handleApiStatusChange = (event) => {
        PubSub.publish('CURRENT PAGE', 1)
        props.getCurrentapifrombar(event.target.value)
    }

    const magValChange = (event, newValue) => {
        props.getMagValfrombar(newValue)
    }

    const refreshValChange = (event, newValue) => {
        props.getRefreshValfrombar(newValue)
    }

    const antiAliasingChange = (event, newValue) => {
        props.getAntiAliasingbar(newValue)
    }

    const getLocation = () => {
        props.getCurrentLocation()
    }
    const getLight = () => {
        if (props.globalLight === true) {
            props.getLightStatusfrombar(false)
        } else {
            props.getLightStatusfrombar(true)
        }
    }

    const getFps = () => {
        if (props.showFps === true) {
            props.getShowFpsfrombar(false)
        } else {
            props.getShowFpsfrombar(true)
        }
        console.log('currentfps:' + props.showFps)
    }

    const clearAllInterval = () => {
        for (let i = 1; i < 100000; i++) {
            clearInterval(i);
        }
    }

    const toggleAutoRefresh = () => {
        if (autoRefresh == false) {
            setAutoRefresh(true)
            getAutoRefresh()
            console.log('开始刷新')
        } else {
            setAutoRefresh(false)
            clearAllInterval()
            console.log('停止刷新')
        }
    }

    const getAutoRefresh = () => {

        async function postData() {
            if (autoRefresh == true) {
                return
            }
            const requestbody = selectApi(props.currentApi)
            try {
                const res = await fetch('http://127.0.0.1:8080/api/events', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: requestbody
                });
                const { data } = await res.json();
                console.log(props.latestquakeData.time)
                if (data[0].time > props.latestquakeData.time) {
                    var tempData = {
                        latitude: data[0].latitude,
                        longitude: data[0].longitude,
                        place: data[0].place,
                        time: data[0].time,
                        magnitude: data[0].magnitude
                    }
                    PubSub.publish('URGENT REPORT', tempData)
                    PubSub.publish('OPEN ALERT')
                    publish('FORCED REFRESH', true)
                    clearInterval(myInterval)
                    setMyInterval(undefined)
                    return
                }
                console.log('刷新成功')
            } catch (error) {
                console.log('刷新错误')
            }
        }
        setMyInterval(
            setInterval(() => {
                if (autoRefresh == true) {
                    console.log('进了')
                    return
                } else {
                    console.log("refreshing")
                    postData()
                }
            }, 60000 * props.refreshVal)
        )
    }

    const selectApi = (currentApi) => {
        if (currentApi == 1) {
            return `source=SCEW`
        } else if (currentApi == 2) {
            return `source=SCQR`
        } else if (currentApi == 3) {
            return `source=CEIC`
        } else if (currentApi == 4) {
            return `source=USGS`
        } else if (currentApi == 5) {
            return `source=HKO`
        } else if (currentApi == 6) {
            return `source=JMA`
        } else {
            alert("api类型错误")
            return
        }
    }

    const longitudeOnChange = (event) => {
        if (event.target.value == '') {
            setGetDataNotice("数值不能为空！")
        } else {
            manualSetLong = event.target.value
        }
    }

    const latitudeOnChange = (event) => {
        if (event.target.value == '') {
            setGetDataNotice("数值不能为空！")
        } else {
            manualSetLat = event.target.value
        }
    }

    return (
        <>
            <Drawer variant="persistent" anchor="right" open={props.open} sx={{ transition: 'width 0.3s' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        控制面板&nbsp;&nbsp;&nbsp;
                        <Button onClick={() => {
                            Swal.fire({
                                width: '600px',
                                title: '帮助',
                                position: 'top',
                                icon: 'info',
                                html: '<p></p>' + '<p></p>' + '<p style="text-align: left; line-height: 1.1;">实际光照开关</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--可以通过点击该开关在视图中显示地球实际的昼半球和夜半球。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">帧率显示开关</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--可以通过点击该开关显示视图的刷新率，及时查看显示性能指标。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">自动数据刷新</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--启用该功能即可使得数据在后台及时请求，刷新的间隔与刷新时间间隔的设置一致。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">地震来源API选择</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--点击即可选择地图中展示的地震数据来源，不同的数据来源通常具有一定的区域性</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">以下是选择何种API作为数据来源的一些提示</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--四川预警/四川速报 以四川及周边区域为主，四川速报兼顾国内、国际主要地震。可请求数据量最大，时间较长。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--中国地震台网 以中国的大部分地震、以及世界的主要地震为主，时间序列比前者短。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--USGS 以美国的地震及世界近期主要地震为主，可请求的时间序列仅有数天。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--香港天文台 世界近期主要5级以上地震为主。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--日本气象厅 日本的地震数据丰富，更新及时。兼顾国际主要地震。 </p>' +
                                    '<p style="text-align: left; line-height: 1.1;">震级显示设置</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--拖动以更改地震点的颜色以区分地震震级。默认为3.5</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">热力图点半径设置</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--拖动以更改热力图点半径，点的半径表现为某点最远能受到距离该点多远的地理要素的影响，即该点的核密度不受带宽距离以外的点影响。重新生成热力图以生效。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">刷新时间间隔</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--更改刷新时间，默认为1分钟。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">震级显示设置</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--拖动以更改地震点的颜色以区分地震震级。</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">抗锯齿参数</p>' +
                                    '<p style="text-align: left; line-height: 1.1;">--参数数值更高画质更细腻，但过高的参数会给CPU或GPU带来处理压力，引起渲染卡顿。默认设置为1.5，符合主流计算机配置。如需调整请酌情设置。</p>',
                                padding: '2px'

                            })
                        }}>帮助</Button>
                        {props.open && (
                            <IconButton onClick={handleToggleDrawer} sx={{ position: 'relative', bottom: '0px', left: '115px' }}>
                                <ChevronRightIcon />
                            </IconButton>
                        )}
                    </Typography>
                    <Typography variant='subtitle2' sx={{ textAlign: 'center' }}>
                        您的位置
                    </Typography>
                    <Typography variant='subtitle2' sx={{ textAlign: 'center' }}>
                        经度:{props.longitude.toFixed(4)} 纬度:{props.latitude.toFixed(4)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="outlined" color='info' onClick={getLocation} sx={{ width: '135px', height: '30px' }}>自动获取位置</Button>&nbsp;
                        <Button variant='outlined' color='info' sx={{ width: '135px', height: '30px' }} onClick={handleGetPositionOpen}>手动设置位置</Button>
                    </Box>

                    <FormGroup>
                        <FormControlLabel control={<Switch defaultChecked={false} />} label="实际光照" onChange={getLight} />
                        <FormControlLabel control={<Switch defaultChecked={false} />} label="帧率显示" onChange={getFps} />
                        <FormControlLabel control={<Switch defaultChecked={false} value={autoRefresh} />} label="自动数据刷新" onChange={toggleAutoRefresh} />
                    </FormGroup>
                    <FormControl>
                        <FormLabel>选择地震信息来源API</FormLabel>
                        <RadioGroup
                            defaultValue='1'
                            name="radio-buttons-group"
                            onChange={handleApiStatusChange}
                        >
                            <FormControlLabel value="1" control={<Radio />} label="四川预警" />
                            <FormControlLabel value="2" control={<Radio />} label="四川速报" />
                            <FormControlLabel value="3" control={<Radio />} label="中国地震台网" />
                            <FormControlLabel value="4" control={<Radio />} label="USGS" />
                            <FormControlLabel value="5" control={<Radio />} label="香港天文台,HKO" />
                            <FormControlLabel value="6" control={<Radio />} label="日本气象厅,JMA" />
                        </RadioGroup>
                    </FormControl>
                    <Typography variant='subtitle2'>
                        震级在此以下用黄点表示，在此及以上用红点表示
                        <Slider
                            aria-label="magVal"
                            defaultValue={3.5}
                            valueLabelDisplay="auto"
                            step={0.5}
                            marks
                            min={2}
                            max={7}
                            onChange={magValChange}
                        />
                    </Typography>
                    <Typography variant='subtitle2'>
                        热力图点半径
                        <Slider
                            aria-label="heatmapRadius"
                            defaultValue={20}
                            valueLabelDisplay="auto"
                            step={5}
                            marks
                            min={10}
                            max={50}
                            onChange={(event, newValue) => { publish('HEATMAP RADIUS', newValue) }}
                        />
                    </Typography>
                    <Typography variant='subtitle2'>
                        刷新时间间隔（分）
                        <Slider
                            aria-label="refreshVal"
                            defaultValue={2}
                            valueLabelDisplay="auto"
                            step={0.5}
                            marks
                            min={0.5}
                            max={10}
                            onChange={refreshValChange}
                        />
                    </Typography>
                    <Typography variant='subtitle2'>
                        抗锯齿参数
                        <Slider
                            aria-label="refreshVal"
                            defaultValue={1.5}
                            valueLabelDisplay="auto"
                            step={0.25}
                            marks
                            min={1}
                            max={3}
                            onChange={antiAliasingChange}
                        />
                    </Typography>
                </Box>
                {props.open && (
                    <IconButton onClick={handleToggleDrawer} sx={{ position: 'relative', marginTop: '-20px', left: '4px', width: '40px' }}>
                        <ChevronRightIcon />
                    </IconButton>
                )}
                <Dialog
                    open={getPositionOpen}
                    onClose={handleGetPositionClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        手动输入位置
                    </DialogTitle>
                    <DialogContent>
                        <TextField id="outlined-basic" label="输入经度" variant="outlined" sx={{ marginTop: '2px' }} onChange={longitudeOnChange} />&nbsp;
                        <TextField id="outlined-basic" label="输入纬度" variant="outlined" sx={{ marginTop: '2px' }} onChange={latitudeOnChange} />
                        <Typography variant='body2' sx={{ padding: '2px' }}>{getDataNotice}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setGetPositionOpen(false) }} autoFocus>
                            取消
                        </Button>
                        <Button onClick={handleGetPositionClose} autoFocus>
                            确定
                        </Button>
                    </DialogActions>
                </Dialog>
            </Drawer>
        </>
    );
};
export default LeftSidebar_3;
