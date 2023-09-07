

const RuncurveV2 = {
    // 1mごとのトンネル情報を求める関数
    // tunnels: トンネル情報
    // => 1mごとのトンネル情報
    getTunnelInfo: (tunnels, length) => {
        let result = new Array(length).fill(0);
        for (let i = 0; i < tunnels.length; i++) {
            result.fill(tunnels[2], tunnels[0], tunnels[1])
        }
        return result;
    },
    // 1mごとの曲線半径情報を求める関数
    // curves: 曲線情報
    // => 1mごとの曲線情報
    getCurveInfo: (curves, length) => {
        let result = new Array(length).fill(0);
        for (let i = 0; i < curves.length; i++) {
            result = result.fill(curves[2], curves[0], curves[1])
        }
        return result;
    },
    // 1mごとの勾配情報を求める関数
    // gradients: 勾配情報
    // length: 戻り値の長さ
    // startLength: 開始位置
    // => 1mごとの勾配情報
    getGradientInfo: (gradients, length) => {
        let result = new Array(length).fill(0);
        for (let j = gradients[i][0]; j < gradients[i][1]; j++) {
            result = result.fill(gradients[2], gradients[0], gradients[1])
        }
        return result;
    },
    // 加速した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getAccelNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = (vehicle.tractiveForces[Math.floor(currentSpeed)] - vehicle.runningResistance[Math.floor(currentSpeed)]) / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient;
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 加速した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getAccelNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = (vehicle.tractiveForces[Math.floor(currentSpeed)] - vehicle.runningResistance[Math.floor(currentSpeed)]) / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient;
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 減速した際の1m前の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getDecelBeforeSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = -vehicle.runningResistance[Math.floor(currentSpeed)] / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient -(vehicle.deceleration*30.9);
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 減速した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getDecelNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = -vehicle.runningResistance[Math.floor(currentSpeed)] / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient +(vehicle.deceleration*30.9);
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 惰行した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getCoastingNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        let force = (-vehicle.runningResistance[Math.floor(currentSpeed)]) / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient;
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },

    /**
     * 
     * @param {Route} route 
     * @param {Vehicle} vehicle 
     */
    getSpeedAllStation: (route, vehicle) => {
        const lineLength = route.stations.slice(-1)[0].position;
        let resultSpeed = new Array(lineLength).fill(0);
        let tunnelInfo = runcurve.getTunnelInfo(route.tunnels, lineLength); // tunnel type
        let curveInfo = runcurve.getCurveInfo(route.curves, lineLength); // m
        let gradientInfo = runcurve.getGradientInfo(route.gradients, lineLength); // ‰

        // 駅最高速度を代入
        for (let i = 1; i < route.stations.length; i++) {
            resultSpeed = resultSpeed.fill(route.stations[i-1].maxSpeed, route.stations[i].maxSpeed);
        }

        console.log(route.limitSpeeds)
        // 制限速度を代入
        for (let i = 0; i < route.limitSpeeds.length; i++) {
            const limitSpeed = route.limitSpeeds[i];
            resultSpeed = resultSpeed.fill(limitSpeed[2], limitSpeed[0], limitSpeed[1]);
        }

        // 制限速度が変わる地点を代入
        let limitSpeedChangePoint = [];
        limitSpeedChangePoint.push(...route.stations.map(s => s.position));
        limitSpeedChangePoint.push(...route.curves.map(c => [c[0], c[1]]).flat());
        console.log(limitSpeedChangePoint);

        return {
            speed: resultSpeed,
        };
    }
}