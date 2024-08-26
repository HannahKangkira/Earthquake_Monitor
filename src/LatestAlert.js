const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const [alertOpen, setAlertOpen] = useState(false);

const handleAlertClickOpen = () => {
    setAlertOpen(true);
};

const handleAlertClose = () => {
    setAlertOpen(false);
};

<Dialog
    open={alertOpen}
    TransitionComponent={Transition}
    keepMounted
    onClose={handleAlertClose}
    aria-describedby="alert-dialog-slide-description"
>
    <DialogTitle>
        <Typography variant='h4' sx={{ textAlign: 'center', color: 'red' }}>
            注意！地震发生!
        </Typography>
    </DialogTitle>
    <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                四川省 汶川县 发生地震
            </Typography>
            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                发震时间2012/5/12 10:00:01
            </Typography>
            <Typography variant='h6' sx={{ textAlign: 'center', color: 'orange' }}>
                震级 8.0 级，预估烈度 2 级，距您 1900 公里
            </Typography>
            <Typography variant='h6' sx={{ textAlign: 'center', color: 'orange' }}>
                请合理避险！
            </Typography>
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={handleAlertClose}>查看地点</Button>
        <Button onClick={handleAlertClose}>确定</Button>
    </DialogActions>
</Dialog>