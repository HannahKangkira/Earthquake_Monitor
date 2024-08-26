import React, { useEffect, useState } from 'react';
import { Button, IconButton, List, ListItem, Slide, Alert, MenuItem, Select, Menu, Paper, Divider, Drawer, LinearProgress, FormLabel, Typography, Box, Radio, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, RadioGroup, TextField, FormControl, InputLabel } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PubSub, { publish } from 'pubsub-js';
import Swal from 'sweetalert2';
import './Sidebar.css'

const Sidebar = (props) => {
    const [open, setOpen] = useState(false);
    const [picked, setPicked] = useState(false)
    const [showBuffer, setShowBuffer] = useState('显示地震点缓冲区')
    const [paperNotice, setNotice] = useState('')
    const [quakeReportOpen, setQuakeReportOpen] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertContent, setAlertContent] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [showVisible, setShowVisible] = useState('地震强度可视化展示')
    const [showGenerate, setGenerate] = useState('展示地震热力图')
    const [showFaults, setShowFaults] = useState('展示断层线')
    const [showVolcanoes, setShowVolcanoes] = useState('展示火山记录')
    const [showBoundaries, setShowBoundaries] = useState('展示板块边界')
    const [anchorUtilitiesEl, setAnchorUtilitiesEl] = useState(null);
    const [anchorDataDisplayEl, setAnchorDataDisplayEl] = useState(null);
    const [anchorDataAnalysisEl, setAnchorDataAnalysisEl] = useState(null);
    const [quakeReportEl, setQuakeReportEl] = useState(null)
    const [sendReportNotice, setSendReportNotice] = useState('')
    const [getReport, setGetReport] = useState(false)
    const [reports, setReports] = useState([{
        name: 'Unknown',
        time: 0,
        feeling: 1,
        lat: 0,
        lon: 0
    }])
    var reportQuakeLoc
    var reportQuakeTime
    var currentLat
    var currentLong
    var shakeFeeling

    var messageSubscription = function (msg, data) {
        switch (msg) {
            case 'CURRENT PICK POINT':
                setPicked(data)
                break;
            case 'PICKED COORD':
                setNotice('坐标:' + data)
                break;
            case 'DIST':
                setNotice('距离:' + data + 'km')
                break;
            case 'POLYGON AREA':
                setNotice('面积:' + data + '㎡')
                break;
            default:
                break;
        }
    }

    PubSub.subscribe('CURRENT PICK POINT', messageSubscription);
    PubSub.subscribe('PICKED COORD', messageSubscription);
    PubSub.subscribe('DIST', messageSubscription);
    PubSub.subscribe('POLYGON AREA', messageSubscription);

    const handleUtilitiesClick = (event) => {
        setAnchorUtilitiesEl(event.currentTarget);
    };

    const handleUtilitiesClose = () => {
        setAnchorUtilitiesEl(null);
    };
    const handleDataDisplayClick = (event) => {
        setAnchorDataDisplayEl(event.currentTarget);
    };

    const handleDataDisplayClose = () => {
        setAnchorDataDisplayEl(null);
    };
    const handleDataAnalysisClick = (event) => {
        setAnchorDataAnalysisEl(event.currentTarget);
    };

    const handleDataAnalysisClose = () => {
        setAnchorDataAnalysisEl(null);
    };

    const handleQuakeReportClick = (event) => {
        setQuakeReportEl(event.currentTarget);
    };

    const handleQuakeReportClose = () => {
        setQuakeReportEl(null);
    };

    const handleToggleDrawer = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleShowDrawer = () => {
        setOpen(true)
    };

    const longitudeOnChange = (event) => {
        console.log(typeof event.target.value)
        if (/[^0-9.-]/.test(event.target.value)) {
            setSendReportNotice("请输入正确的数值！")
        } else {
            if (event.target.value == '') {
                setSendReportNotice("数值不能为空！")
            } else if (event.target.value > 180 || event.target.value < -180) {
                setSendReportNotice("经度输入错误！")
            } else {
                setSendReportNotice('')
                currentLong = event.target.value
                console.log(currentLong)
            }
        }
    }

    const latitudeOnChange = (event) => {
        console.log(typeof event.target.value);
        if (/[^0-9.-]/.test(event.target.value)) {
            setSendReportNotice("请输入正确的数值！");
        } else {
            if (event.target.value === '') {
                setSendReportNotice("数值不能为空！");
            } else if (event.target.value > 90 || event.target.value < -90) {
                setSendReportNotice("纬度输入错误！");
            } else {
                setSendReportNotice('');
                currentLat = event.target.value;
                console.log(currentLat);
            }
        }
    }

    const reportQuakeFeeling = async () => {

        const formData = new URLSearchParams();
        formData.append('reportQuakeLoc', reportQuakeLoc)
        formData.append('reportQuakeTime', reportQuakeTime)
        formData.append('feeling', shakeFeeling)
        formData.append('lat', currentLat);
        formData.append('long', currentLong);
        console.log(formData)

        const res = await fetch('http://10.2.148.244:8080/api/report', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        })
        const { data } = await res.json();

        if (data.result == 'success') {
            setShowSuccess(true)
            setTimeout(() => { setShowSuccess(false) }, 3000)
        } else {
            setAlertContent('数据上传错误！')
            setShowAlert(true)
            setTimeout(() => { setShowAlert(false) }, 3000)
        }
        //console.log(data.result)
    }

    const getDatafromdb = async () => {

        const res = await fetch('http://10.2.148.244:8080/api/getreport', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
        })
        const { data } = await res.json();
        console.log(data)
        setReports(data)
    }

    return (
        <>
            <Drawer id='sidebar' variant="persistent" anchor="left" open={open} sx={{ transition: 'width 0.3s', height: '200px' }}>
                <Box id='sidebar' sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Earthquake Monitor
                    </Typography>
                    <Divider />
                    <div>
                        <Button onClick={handleUtilitiesClick} variant="outlined" color="primary" sx={{ marginTop: '8px', width: '230px' }}>
                            实用功能
                            <ArrowDropDownIcon ></ArrowDropDownIcon>
                        </Button>
                        <Menu
                            anchorEl={anchorUtilitiesEl}
                            open={Boolean(anchorUtilitiesEl)}
                            onClose={handleUtilitiesClose}

                        >
                            <MenuItem onClick={() => {
                                PubSub.publish('PICK POINT', true)
                                handleUtilitiesClose()
                            }} sx={{ width: '230px' }}>坐标拾取器</MenuItem>
                            <MenuItem onClick={() => {
                                PubSub.publish('START MEASURE', true)
                                handleUtilitiesClose()
                            }} sx={{ width: '230px' }}>开始测距</MenuItem>
                            <MenuItem onClick={() => {
                                PubSub.publish('START MEASURE AREA', true)
                                handleUtilitiesClose()
                            }} sx={{ width: '230px' }}>测量面积</MenuItem>
                            <MenuItem onClick={() => {
                                publish('DOWNLOAD', true)
                                handleUtilitiesClose()
                            }} sx={{ width: '230px' }}>导出现有点数据为GeoJSON</MenuItem>
                        </Menu>
                    </div>
                    <div>
                        <Button onClick={handleDataDisplayClick} variant="outlined" color="primary" sx={{ marginTop: '8px', width: '230px' }}>
                            数据展示
                            <ArrowDropDownIcon ></ArrowDropDownIcon>
                        </Button>
                        <Menu
                            anchorEl={anchorDataDisplayEl}
                            open={Boolean(anchorDataDisplayEl)}
                            onClose={handleDataDisplayClose}

                        >
                            <MenuItem onClick={() => {
                                if (showVisible == '地震强度可视化展示') {
                                    PubSub.publish('VISIBLE MAGNITUDE', true)
                                    setShowVisible('关闭可视化展示')
                                } else if (showVisible == '关闭可视化展示') {
                                    PubSub.publish('VISIBLE MAGNITUDE', false)
                                    setShowVisible('地震强度可视化展示')
                                }
                            }} sx={{ width: '230px' }}>{showVisible}</MenuItem>
                            <MenuItem onClick={() => {
                                if (showFaults == '展示断层线') {
                                    publish('GET FAULT DATA', true)
                                    setShowFaults('移除断层线')
                                } else if (showFaults == '移除断层线') {
                                    publish('REMOVE FAULTS', true)
                                    setShowFaults('展示断层线')
                                }
                            }} sx={{ width: '230px' }}>{showFaults}</MenuItem>
                            <MenuItem onClick={() => {
                                if (showVolcanoes == '展示火山记录') {
                                    publish('GET VOLCANO DATA', true)
                                    setShowVolcanoes('移除火山点')
                                } else if (showVolcanoes == '移除火山点') {
                                    publish('REMOVE VOLCANO', true)
                                    setShowVolcanoes('展示火山记录')
                                }
                            }}>{showVolcanoes}</MenuItem>
                            <MenuItem onClick={() => {
                                if (showBoundaries == '展示板块边界') {
                                    publish('GET BOUNDARY DATA', true)
                                    setShowBoundaries('移除板块边界')
                                } else if (showBoundaries == '移除板块边界') {
                                    publish('REMOVE BOUNDARIES', true)
                                    setShowBoundaries('展示板块边界')
                                }
                            }}>{showBoundaries}</MenuItem>
                        </Menu>
                    </div>
                    <div>
                        <Button onClick={handleDataAnalysisClick} variant="outlined" color="primary" sx={{ marginTop: '8px', width: '230px' }}>
                            空间分析
                            <ArrowDropDownIcon ></ArrowDropDownIcon>
                        </Button>
                        <Menu
                            anchorEl={anchorDataAnalysisEl}
                            open={Boolean(anchorDataAnalysisEl)}
                            onClose={handleDataAnalysisClose}

                        >
                            <MenuItem onClick={() => {
                                if (showBuffer == '显示地震点缓冲区') {
                                    PubSub.publish('SHOW BUFFER', true)
                                    setShowBuffer('关闭地震点缓冲区')
                                } else {
                                    PubSub.publish('SHOW BUFFER', false)
                                    setShowBuffer('显示地震点缓冲区')
                                }
                            }} sx={{ width: '230px' }}>{showBuffer}</MenuItem>
                            <MenuItem onClick={() => {
                                if (props.currentApi == 1 || props.currentApi == 6) {
                                    if (props.currentApi == 1) {
                                        publish('BOUNDS', {
                                            lonMin: 85,
                                            lonMax: 115,
                                            latMin: 20,
                                            latMax: 50
                                        })
                                    } else if (props.currentApi == 6) {
                                        publish('BOUNDS', {
                                            lonMin: 120,
                                            lonMax: 150,
                                            latMin: 20,
                                            latMax: 50
                                        })
                                    }
                                    if (showGenerate == '展示地震热力图') {
                                        publish('GENERATE HEATMAP', true)
                                        setGenerate('关闭地震热力图')
                                    } else if (showGenerate == '关闭地震热力图') {
                                        publish('REMOVE HEATMAP', true)
                                        setGenerate('展示地震热力图')
                                    }
                                } else {
                                    if (props.currentApi != 1 && props.currentApi != 6 && showGenerate == '关闭地震热力图') {
                                        publish('REMOVE HEATMAP', true)
                                        setGenerate('展示地震热力图')
                                        return
                                    }
                                    Swal.fire({
                                        icon: 'error',
                                        title: '热力图展示不支持此数据源！',
                                        text: '请切换数据来源为 四川速报 或 日本气象厅',
                                    })
                                    return
                                }
                            }} sx={{ width: '230px' }}>{showGenerate}</MenuItem>
                        </Menu>
                    </div>
                    <div>
                        <Button onClick={handleQuakeReportClick} variant="outlined" color="primary" sx={{ marginTop: '8px', width: '230px' }}>
                            震情上报/查看
                            <ArrowDropDownIcon></ArrowDropDownIcon>
                        </Button>
                        <Menu
                            anchorEl={quakeReportEl}
                            open={Boolean(quakeReportEl)}
                            onClose={handleQuakeReportClose}
                        >
                            <MenuItem onClick={() => { setQuakeReportOpen(true) }} sx={{ width: '230px' }}>震情上报</MenuItem>
                            <MenuItem onClick={() => {
                                getDatafromdb()
                                setGetReport(true)
                            }} sx={{ width: '230px' }}>震情查看</MenuItem>
                        </Menu>
                    </div>
                    <Typography>
                        <Button onClick={() => {
                            Swal.fire({
                                html: "<img src='/1.png' alt='组图1' width='300px'/>" + "<img src='/2.png' alt='组图2' width='300px'/>" + "<img src='/3.png' alt='组图3' width='300px'/>",
                                width: '400px'
                            })
                        }}>地震防灾知识</Button>
                    </Typography>
                    <div style={{ fontFamily: '	STZhongsong', fontSize: '22px' }}>图例</div>
                    <div style={{ position: 'absolute', marginTop: '2px', width: '20px', height: "20px", borderRadius: '25px', backgroundColor: 'red' }}></div>
                    <div style={{ position: 'absolute', marginTop: '6px', marginLeft: '30px', fontSize: '10px' }}>{props.magVal}级以上地震</div>
                    <div style={{ position: 'absolute', marginTop: '32px', width: '15px', height: "15px", borderRadius: '10px', backgroundColor: 'yellow' }}></div>
                    <div style={{ position: 'absolute', marginTop: '32px', marginLeft: '30px', fontSize: '10px' }}>{props.magVal}级以下地震</div>
                    <div style={{ position: 'absolute', marginTop: '57px', width: '15px', height: "15px", borderRadius: '10px', backgroundColor: 'blue' }}></div>
                    <div style={{ position: 'absolute', marginTop: '58px', marginLeft: '30px', fontSize: '10px' }}>您的位置</div>
                    <div style={{ position: 'absolute', marginTop: '80px', fontFamily: 'STZhongsong', fontSize: '15px' }}>断层线</div>
                    <div style={{ position: 'absolute', marginTop: '110px', height: '5px', backgroundColor: 'red', zIndex: 900 }}>&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div style={{ position: 'absolute', marginTop: '104px', fontSize: '10px', marginLeft: '20px', height: '5px', zIndex: 900 }}>活动断层</div>
                    <div style={{ position: 'absolute', marginTop: '110px', marginLeft: '75px', height: '5px', backgroundColor: 'blue', zIndex: 900 }}>&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div style={{ position: 'absolute', marginTop: '104px', fontSize: '10px', marginLeft: '95px', height: '5px', zIndex: 900 }}>第四纪断层</div>
                    <div style={{ position: 'absolute', marginTop: '110px', marginLeft: '158px', height: '5px', backgroundColor: 'yellow', zIndex: 900 }}>&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div style={{ position: 'absolute', marginTop: '104px', fontSize: '10px', marginLeft: '178px', height: '5px', zIndex: 900 }}>海域断裂</div>
                    <div style={{ position: 'absolute', marginTop: '140px', height: '5px', backgroundColor: 'greenyellow', zIndex: 900 }}>&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div style={{ position: 'absolute', marginTop: '128px', fontSize: '10px', marginLeft: '20px', height: '15px', width: '80px', zIndex: 900 }}>平原区和盆地区的隐伏断裂</div>
                    <div style={{ position: 'absolute', marginTop: '140px', marginLeft: '100px', height: '5px', backgroundColor: 'purple', zIndex: 900 }}>&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div style={{ position: 'absolute', marginTop: '123px', fontSize: '10px', marginLeft: '120px', height: '30px', width: '110px', zIndex: 900 }}>青藏高原部分地区主要根据卫星影像和区域地质图解释的断裂</div>
                    <div style={{ position: 'absolute', marginTop: '160px', fontFamily: 'STZhongsong', fontSize: '15px' }}>多环缓冲区</div>
                    <div style={{ position: 'absolute', marginTop: '183px', marginLeft: '60px', fontSize: '10px' }}>500km</div>
                    <div style={{ position: 'absolute', marginTop: '220px', marginLeft: '60px', fontSize: '10px', zIndex: 1000 }}>100km</div>
                    <div style={{ position: 'absolute', marginTop: '210px', marginLeft: '60px', fontSize: '10px', zIndex: 1000, color: 'white' }}>200km</div>
                    <div style={{ position: 'absolute', marginTop: '198px', marginLeft: '60px', fontSize: '10px', zIndex: 1000 }}>300km</div>
                    <div style={{ position: 'absolute', marginTop: '233px', marginLeft: '60px', fontSize: '10px', zIndex: 1000 }}>50km</div>
                    <div style={{ position: 'absolute', marginTop: '220px', width: '100px', height: "100px", borderRadius: '80px', backgroundColor: 'yellow', border: '2px solid', zIndex: 990, marginLeft: '25px', }}></div>
                    <div style={{ position: 'absolute', marginTop: '231px', width: '77px', height: "77px", borderRadius: '80px', backgroundColor: 'orange', border: '2px solid', zIndex: 991, marginLeft: '36px', }}></div>
                    <div style={{ position: 'absolute', marginTop: '245px', width: '50px', height: "50px", borderRadius: '80px', backgroundColor: 'red', border: '2px solid', zIndex: 992, marginLeft: '49px', }}></div>
                    <div style={{ position: 'absolute', marginTop: '197px', width: '148px', height: "148px", borderRadius: '80px', backgroundColor: 'skyblue', border: '2px solid' }}></div>
                    <div style={{ position: 'absolute', marginTop: '210px', marginLeft: '15px', width: '120px', height: "120px", borderRadius: '120px', backgroundColor: 'BLUE', border: '2px solid' }}></div>
                </Box>
                <Paper elevation={4} sx={{ position: 'absolute', marginLeft: '50px', marginTop: '251%', width: '195px', height: '5.5%' }}>
                    <Typography sx={{ fontSize: '13px', textAlign: 'center', marginTop: '10px' }}>
                        {paperNotice}
                    </Typography>
                </Paper>
                {open && (
                    <IconButton onClick={handleToggleDrawer} sx={{ position: 'absolute', marginTop: '250%', left: '4px', zIndex: 999, width: '40px' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
                <Dialog
                    open={quakeReportOpen}
                    onClose={() => { setQuakeReportOpen(false) }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        震情上报
                    </DialogTitle>
                    <DialogContent>
                        <Slide direction="down" in={showAlert} mountOnEnter unmountOnExit>
                            <Alert severity="error" sx={{ position: 'fixed', marginTop: '-20px', marginLeft: '130px', zIndex: 1000 }}>{alertContent}</Alert>
                        </Slide>
                        <Slide direction="down" in={showSuccess} mountOnEnter unmountOnExit>
                            <Alert severity='success' sx={{ position: 'fixed', marginTop: '-20px', marginLeft: '140px', zIndex: 1000 }}>信息提交成功！</Alert>
                        </Slide>
                        <FormControl fullWidth sx={{ marginTop: '5px' }}>
                            <InputLabel id="demo-simple-select-label">选择汇报事件</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="汇报事件列表"
                            >
                                {props.earthquakeData.map((earthquake) => (
                                    <MenuItem value={earthquake.time} onClick={() => {
                                        reportQuakeLoc = earthquake.place
                                        reportQuakeTime = earthquake.time
                                        console.log(reportQuakeLoc, reportQuakeTime)
                                    }}>{earthquake.place},{new Date(earthquake.time).toLocaleString()}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant='body2' sx={{ paddingTop: '5px', paddingBottom: '6px' }}>输入坐标，或使用现有值{props.userLat},{props.userLong}</Typography>
                        <TextField id="outlined-basic" label="输入经度" variant="outlined" sx={{ marginTop: '2px', height: '40px' }} onChange={longitudeOnChange} onBlur={longitudeOnChange} />&nbsp;
                        <TextField id="outlined-basic" label="输入纬度" variant="outlined" sx={{ marginTop: '2px', height: '40px' }} onChange={latitudeOnChange} onBlur={latitudeOnChange} />
                        <Typography variant='body2' sx={{ paddingTop: '20px', marginBottom: '10px' }}>{sendReportNotice}</Typography>
                        <FormControl>
                            <FormLabel>选择您感受到的震感</FormLabel>
                            <RadioGroup
                                defaultValue='1'
                                name="radio-buttons-group"
                                onChange={(event) => {
                                    shakeFeeling = event.target.value
                                    console.log(shakeFeeling)
                                }}
                            >
                                <FormControlLabel value="1" control={<Radio />} label="无感" />
                                <FormControlLabel value="2" control={<Radio />} label="轻微" />
                                <FormControlLabel value="3" control={<Radio />} label="中度" />
                                <FormControlLabel value="4" control={<Radio />} label="较强" />
                                <FormControlLabel value="5" control={<Radio />} label="严重" />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setQuakeReportOpen(false) }} autoFocus>关闭</Button>
                        <Button onClick={() => {
                            console.log(reportQuakeLoc, reportQuakeTime, shakeFeeling, currentLat, currentLong)
                            if (shakeFeeling == undefined || shakeFeeling == '') {
                                shakeFeeling = 1
                            }
                            if (reportQuakeLoc == '' || reportQuakeLoc == undefined || reportQuakeTime == '' || reportQuakeTime == undefined || currentLat == '' || currentLat == undefined || currentLong == '' || currentLong == undefined) {
                                setAlertContent('请将信息填写完整！')
                                setShowAlert(true)
                                setTimeout(() => { setShowAlert(false) }, 3000)
                                return
                            } else {
                                reportQuakeFeeling()
                                setTimeout(() => { setQuakeReportOpen(false) }, 3000)
                            }
                        }} autoFocus>确定</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={getReport}
                    onClose={() => { setGetReport(false) }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        震情查看
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {reports.map((report, index) => (
                                <ListItem key={index}>
                                    <Paper elevation={3} sx={{ padding: 1, width: '600px' }}>
                                        <Typography >
                                            <Typography variant='body2'>{report.name}</Typography>
                                            <Typography variant='body2' sx={{ marginLeft: '300px', marginTop: '-20px' }}>发震时间：{new Date(report.time).toLocaleString()}</Typography>
                                            <Typography variant='body2'>坐标：{report.lat},{report.lon}</Typography>
                                            <Typography variant='body2' sx={{ marginLeft: '300px', marginTop: '-20px' }}>感受强度：{report.feeling == 5 ? '严重' : report.feeling == 4 ? '较强' : report.feeling == 3 ? '中度' : report.feeling == 2 ? '轻微' : '无感'}</Typography>

                                        </Typography>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setGetReport(false) }} autoFocus>关闭</Button>
                        <Button onClick={() => {
                            setGetReport(false)
                        }} autoFocus>确定</Button>
                    </DialogActions>
                </Dialog>
            </Drawer>
            {!open && (
                <Button variant="contained" onClick={handleShowDrawer} sx={{ position: 'fixed', bottom: '20px', left: '6px', zIndex: 1, opacity: '90%' }} >
                    <ChevronRightIcon />
                </Button>
            )}
        </>
    );
};
export default Sidebar;
