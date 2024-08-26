import React, { useState, useEffect } from 'react';
import { Alert, LinearProgress, Slide, List, ListItem, Box, Drawer, Typography, IconButton, Paper, MenuItem, Select, InputLabel, TextField } from '@mui/material';
import { Cartesian3 } from 'cesium';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PubSub from 'pubsub-js'

const LeftSidebar_1 = (props) => {
    const [open, setOpen] = useState(false);
    const [pageSize, setSize] = useState(30)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState()
    const [totalRecords, setRecordsNum] = useState(860)
    const [startTime, setStart] = useState()
    const [endTime, setEnd] = useState()
    const [progressVisible, setVisible] = useState('collapse')
    const [filterApplied, setFilterApplied] = useState(false)
    const [showAlertFlag, setFlag] = useState(false)
    const [noticeString, setNoticeString] = useState()
    const [filterMagMax, setFilterMagMax] = useState(undefined)
    const [filterMagMin, setFilterMagMin] = useState(undefined)
    const [filterMagApplied, setFilterMagApplied] = useState(false)
    const [wordsOnSelectMagButton, setMagWords] = useState('确定')
    const [forcedRefresh, setForcedRefresh] = useState(false)
    const [wordsOnTimeSelectButton, setTimeSelectWords] = useState('确定')
    const slicedQuakeData = props.earthquakeData

    var messageSubscription = function (msg, data) {
        switch (msg) {
            case 'CURRENT PAGE':
                setCurrentPage(data)
                break;
            case 'FORCED REFRESH':
                setForcedRefresh(data)
                break;
            default:
                break;
        }
    }

    PubSub.subscribe('CURRENT PAGE', messageSubscription)
    PubSub.subscribe('FORCED REFRESH', messageSubscription)

    const handleToggleDrawer = () => {
        setOpen((open) => !open);
        sendData(false);
    };

    const alertFlagControl = (notice) => {
        setNoticeString(notice)
        if (showAlertFlag == false) {
            setFlag(true)
            setTimeout(() => { setFlag(false) }, 3000)
        }
    }

    const sendData = (value) => {
        props.getValuefrombar(value);
    };

    const sendEarthquakeData = (value) => {
        props.getDatafrombar(value);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            getData(props.currentApi, currentPage - 1, pageSize)
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        getData(props.currentApi, currentPage + 1, pageSize)
        if (currentPage + 1 <= totalPages) {
            setCurrentPage(currentPage + 1)
        }
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setCurrentPage(1)
        if (!isNaN(newSize) && newSize > 0) {
            setSize(newSize);
        }
    };

    const handleMagFilterClicked = () => {
        if (filterMagApplied === false) {
            console.log('max', filterMagMax, 'min', filterMagMin)
            if (filterMagMax == undefined && filterMagMin == undefined) {
                alertFlagControl('震级筛选不能存在两个空值！')
                return
            }
            if (filterMagMax > 10 || filterMagMin < 0) {
                alertFlagControl('震级输入错误！')
                return
            } else {
                selectedByMagnitude()
                setFilterMagApplied(true)
                setMagWords('撤销')
            }
        } else {
            console.log('关闭！')
            console.log(filterMagApplied)
            setCurrentPage(1)
            setSize(30)
            setFilterMagApplied(false)
            setFilterApplied(false)
            getData(props.currentApi, currentPage, pageSize)
            setMagWords('确定')
            setTimeSelectWords('确定')
        }
    }

    const sendTotalData = (value) => {
        props.getTotalDatafrombar(value)
    }

    const moveToNewPage = (event) => {
        const pageNum = parseInt(event.target.value);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
        } else {
            setNoticeString('请输入正确的页码!')
        }
        getData(props.currentApi, pageNum, pageSize)

    };

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

    const handleTimeFilterClicked = () => {
        if (filterApplied === false) {
            //console.log('starttime', startTime, 'endtime', endTime)
            if (startTime == null || endTime == null || startTime == undefined || endTime == undefined) {
                alertFlagControl('日期输入不能存在空值！')
                return
            }
            if (startTime >= endTime) {
                alertFlagControl('日期输入错误！')
                return
            } else {
                selectedByTime(props.currentApi)
                setFilterApplied(true)
                setTimeSelectWords('撤销')
            }
        } else {
            console.log('关闭！')
            //console.log(filterApplied)
            setCurrentPage(1)
            setSize(30)
            setFilterApplied(false)
            getData(props.currentApi, currentPage, pageSize)
            setTimeSelectWords('确定')
        }
    }

    const stampToDate = (timestamp) => {
        var date = new Date(timestamp);
        var year = date.getFullYear();
        // 注意：月份从0开始，所以要加1
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        var formattedDate = `${year}-${month}-${day}`
        return formattedDate
    }
    useEffect(() => {
        //console.log(props.currentApi, currentPage, pageSize)
        getData(props.currentApi, currentPage, pageSize)
        //console.log('currentApi', props.currentApi)
    }, [currentPage, props.currentApi, pageSize]);

    const forcedToRefresh = () => {
        if (forcedRefresh == true) {
            setCurrentPage(1)
            getData(props.currentApi, currentPage, pageSize)
            setForcedRefresh(false)
            console.log('已经刷新')
        }
    }

    const getData = async (currentApi, currentPage, pageSize) => {
        setVisible('visible')
        var requestbody = selectApi(currentApi)

        const res = await fetch('http://10.2.148.244:8080/api/events', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: requestbody
        })

        const { data } = await res.json();

        sendTotalData(data)
        setRecordsNum(data.length)
        if (currentPage == 1) {
            const [latest, ...later] = data
            PubSub.publish('LATEST DATA', {
                place: latest.place,
                time: latest.time,
                magnitude: latest.magnitude,
                longitude: latest.longitude,
                latitude: latest.latitude
            })
        }
        if ((data.length % pageSize) != 0) {
            setTotalPages(parseInt(data.length / pageSize) + 1)
        }
        if (((currentPage - 1) * pageSize + pageSize) <= data.length) {
            sendEarthquakeData(data.slice((currentPage - 1) * pageSize, (currentPage * pageSize)))
            PubSub.publish('EARTHQUAKE DATA', data.slice((currentPage - 1) * pageSize, (currentPage * pageSize)))
        } else {
            sendEarthquakeData(data.slice(data.length - pageSize, data.length - 1))
        }
        setVisible('collapse')
    }

    const selectedByTime = async (currentApi) => {
        setVisible('visible')
        setCurrentPage(1)
        setTotalPages(1)
        var requestbody = selectApi(currentApi)
        const res = await fetch('http://10.2.148.244:8080/api/events', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: requestbody
        })

        const { data } = await res.json();
        var tempData = []
        data.forEach(function (item) {
            if (item.time >= startTime && item.time <= endTime) {
                tempData.push(item)
            }
        })
        if (tempData == []) {
            alertFlagControl('无符合条件的地震记录！')
            setVisible('collapse')
            return
        } else {
            sendEarthquakeData(tempData)
            console.log('data added')
            console.log(tempData)
            setVisible('collapse')
        }
    }

    const selectedByMagnitude = () => {
        setVisible('visible')
        setCurrentPage(1)
        setTotalPages(1)
        var dataToSelected = props.earthquakeData
        var tempData = []
        if (filterMagMax == undefined && filterMagMin != undefined) {
            dataToSelected.forEach(function (item) {
                if (item.magnitude >= filterMagMin) {
                    tempData.push(item)
                }
            })
        } else if (filterMagMax != undefined && filterMagMin == undefined) {
            dataToSelected.forEach(function (item) {
                if (item.magnitude <= filterMagMax) {
                    tempData.push(item)
                }
            })
        } else if (filterMagMax != undefined && filterMagMin != undefined) {
            dataToSelected.forEach(function (item) {
                if (item.magnitude <= filterMagMax && item.magnitude >= filterMagMin) {
                    tempData.push(item)
                }
            })
        } else {
            alertFlagControl('筛选错误')
        }
        if (tempData == []) {
            alertFlagControl('无符合条件的地震记录！')
            setVisible('collapse')
            return
        } else {
            sendEarthquakeData(tempData)
            console.log('data added')
            console.log(tempData)
            setVisible('collapse')
        }
    }

    forcedToRefresh()

    return (
        <>
            <Drawer variant="persistent" anchor="right" open={props.open} sx={{ transition: 'width 0.3s' }}>
                <Slide direction="down" in={showAlertFlag} mountOnEnter unmountOnExit>
                    <Alert severity="error" sx={{ position: 'fixed', marginTop: '40px', marginLeft: '115px', zIndex: 1000 }}>{noticeString}</Alert>
                </Slide>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        地震列表
                        {props.open && (
                            <IconButton onClick={handleToggleDrawer} sx={{ position: 'relative', bottom: '0px', left: '250px' }}>
                                <ChevronRightIcon />
                            </IconButton>
                        )}
                    </Typography>
                    <LinearProgress sx={{ visibility: progressVisible }} />
                    <List>
                        {slicedQuakeData.map((earthquake, index) => (
                            // Render earthquake list items
                            <ListItem key={index} onClick={() => { /* Handle click here */ }}>
                                <Paper elevation={3} sx={{ padding: 1.5, width: '320px' }} onClick={() => { PubSub.publish('FLY DEST', Cartesian3.fromDegrees(earthquake.longitude, earthquake.latitude, 3000)) }}>
                                    <Typography variant="body2">
                                        {earthquake.place}
                                    </Typography>
                                    <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                                        {`坐标：${parseFloat(earthquake.longitude).toFixed(4)}` + ' ' + `${parseFloat(earthquake.latitude).toFixed(4)}`}&nbsp;
                                        <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                                            {`${new Date(earthquake.time).toLocaleString()}` + ' ' + `${earthquake.distance == undefined ? '' : earthquake.distance + 'km'}`}
                                        </Typography>
                                        <Typography variant="h5" sx={{ position: 'absolute', marginTop: '-28px', marginLeft: '195px' }}>
                                            {`M${earthquake.magnitude}`}
                                        </Typography>
                                        <Paper
                                            sx={{
                                                position: 'absolute',
                                                width: '60px',
                                                height: '70px',
                                                marginTop: '-65px',
                                                marginLeft: '263px',
                                                backgroundColor: earthquake.magnitude < 4 ? '#00BBFF' : earthquake.magnitude < 6 ? 'orange' : earthquake.magnitude < 7 ? 'red' : 'magenta',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            <Typography variant="h2" align='center' sx={{ color: 'white', marginTop: '1px' }}>
                                                {parseInt(earthquake.magnitude)}
                                            </Typography>
                                        </Paper>
                                    </Typography>
                                </Paper>
                            </ListItem>
                        ))}
                    </List>
                    {/* Pagination controls */}
                    <LinearProgress sx={{ visibility: progressVisible }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                            <InputLabel id="demo-select-small-label" sx={{ fontSize: '10px' }}>展示信息条数</InputLabel>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={pageSize}
                                label="展示条数"
                                onChange={handlePageSizeChange}
                                sx={{ fontSize: '15px', height: '30px', width: '75px' }}
                            >
                                <MenuItem value="" sx={{ fontSize: '15px', height: '25px' }}>
                                    <em>30</em>
                                </MenuItem>
                                <MenuItem value={30} sx={{ fontSize: '15px', height: '25px' }}>30</MenuItem>
                                <MenuItem value={50} sx={{ fontSize: '15px', height: '25px' }}>50</MenuItem>
                                <MenuItem value={60} sx={{ fontSize: '15px', height: '25px' }}>60</MenuItem>
                            </Select>
                            <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                <ChevronLeftIcon />
                            </IconButton>&nbsp;
                            {currentPage}/{totalPages}&nbsp;
                            <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                                <ChevronRightIcon />
                            </IconButton>&nbsp;
                            <TextField id="outlined-basic" label="前往" variant="outlined" size='small' sx={{ width: '90px' }} onChange={moveToNewPage} />
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                            截取&nbsp;
                            <input type="date" id="start" name="startdate" value={stampToDate(startTime)} min="2018-01-01" max={stampToDate((new Date()).valueOf())} onChange={(e) => {
                                setStart(e.target.valueAsNumber)
                            }} />&nbsp;
                            至&nbsp;
                            <input type="date" id="start" name="enddate" value={stampToDate(endTime)} min="2018-01-01" max={stampToDate((new Date()).valueOf())} onChange={(e) => {
                                setEnd(e.target.valueAsNumber)
                            }} />&nbsp;
                            的地震&nbsp;
                            <button onClick={handleTimeFilterClicked}>{wordsOnTimeSelectButton}</button>
                        </Typography>

                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                            震级&nbsp;
                            <input type='text' style={{ width: '90px' }} onChange={(e) => {
                                setFilterMagMin(e.target.value)
                            }}></input>&nbsp;
                            至&nbsp;
                            <input type='text' style={{ width: '90px' }} onChange={(e) => {
                                setFilterMagMax(e.target.value)
                            }}></input>&nbsp;
                            的地震&nbsp;
                            <button onClick={handleMagFilterClicked}>{wordsOnSelectMagButton}</button>
                        </Typography>
                    </Box>
                </Box>
                {props.open && (
                    <IconButton onClick={handleToggleDrawer} sx={{ position: 'relative', marginBottom: '16px', marginLeft: '8px', width: '40px' }}>
                        <ChevronRightIcon />
                    </IconButton>
                )}
            </Drawer>
        </>
    );
};
export default LeftSidebar_1;
