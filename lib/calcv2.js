

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
    getSpeedAllStation: (route, vehicle, isManualControl) => {
        if (isManualControl) {
            console.log("Manual Control Mode")
        }
        const lineLength = route.stations.slice(-1)[0].position;
        let resultSpeed = new Array(lineLength).fill(0);
        const notchInfo = new Array(lineLength).fill("");
        let limitSpeed = null;
        let tunnelInfo = runcurve.getTunnelInfo(route.tunnels, lineLength); // tunnel type
        let curveInfo = runcurve.getCurveInfo(route.curves, lineLength); // m
        let gradientInfo = runcurve.getGradientInfo(route.gradients, lineLength); // ‰

        // 駅最高速度を代入
        for (let i = 1; i < route.stations.length; i++) {
            resultSpeed = resultSpeed.fill(route.stations[i-1].maxSpeed, route.stations[i-1].position, route.stations[i].position);
        }

        // 制限速度を代入
        for (let i = 0; i < route.limitSpeeds.length; i++) {
            const limitSpeed = route.limitSpeeds[i];
            resultSpeed = resultSpeed.fill(limitSpeed[2], limitSpeed[0], limitSpeed[1]);
        }
        limitSpeed = JSON.parse(JSON.stringify(resultSpeed));

        // 制限速度が変わる地点を代入
        let limitSpeedChangePoint = [];
        limitSpeedChangePoint.push(...route.stations.map(s => s.position));
        limitSpeedChangePoint.push(...route.limitSpeeds.map(c => [c[0], c[1]]).flat());
        limitSpeedChangePoint = limitSpeedChangePoint.sort((a, b) => a - b);

        // 駅加速曲線を計算
        if (!isManualControl)
        for (let j = 0;  j < route.stations.length-1; j++) {
            const station = route.stations[j];
            const position = station.position;

            if (station.stopType !== 0) continue; // 通過の場合は無視
            let i = 0;
            let previous = 0;
            resultSpeed[position+i] = 0;
            inloop: while (true)
            {
                if (position+i >= resultSpeed.length)
                    break inloop;
                let speed = RuncurveV2.getAccelNextSpeed(previous, vehicle, curveInfo[position+i], gradientInfo[position+i], tunnelInfo[position+i]);
                if (previous > resultSpeed[position+i])
                    break inloop;
                resultSpeed[position+i] = speed;
                notchInfo[position+i] = "power";
                previous = speed;
                i++;
            }
        }

        // 駅減速曲線を計算
        for (let j = 1; j < route.stations.length; j++) {
            const station = route.stations[j];
            const position = station.position;

            if (station.stopType !== 0) continue; // 通過の場合は無視
            let i = 1;
            let previous = 0;
            resultSpeed[position-1] = 0;
            inloop: while (true) {
                if (i > resultSpeed.length)
                    break inloop;
                let speed = RuncurveV2.getDecelBeforeSpeed(previous, vehicle, curveInfo[position-i], gradientInfo[position-i], tunnelInfo[position-i]);
                if (previous > resultSpeed[position-i])
                    break inloop;
                resultSpeed[position-i] = speed;
                notchInfo[position-i] = "brake";
                previous = speed;
                i++;
            }
        }

        { // 惰行パターン
            let spareSpeed = 2; // 制限速度よりも少し低く設定する
            let isAccel = false; // 再加速する場合にtrue
            let isBrake = false; // 長い下り坂などで再減速する場合にtrue
            
            for (let i = 0; i < limitSpeedChangePoint.length; i++)
            {
                let previous = limitSpeed[limitSpeedChangePoint[i]] - spareSpeed;
                for (let j = 0; j < (limitSpeedChangePoint[i+1] - limitSpeedChangePoint[i]); j++ )
                {
                    const currentIndex = limitSpeedChangePoint[i] + j;

                    let speed = 0;
                    let notchType = "";
                    if (isAccel) {
                        speed = runcurve.getAccelNextSpeed(previous, vehicle, curveInfo[currentIndex], gradientInfo[currentIndex], tunnelInfo[currentIndex]);
                        notchType = "power";
                    }
                    else if (isBrake) {
                        speed = runcurve.getDecelNextSpeed(previous, vehicle, curveInfo[currentIndex], gradientInfo[currentIndex], tunnelInfo[currentIndex]);
                        notchType = "brake";
                    }
                    else {
                        speed = runcurve.getCoastingNextSpeed(previous, vehicle, curveInfo[currentIndex], gradientInfo[currentIndex], tunnelInfo[currentIndex]);
                        notchType = "coasting";
                    }
                    if (currentIndex >= resultSpeed.length)
                        break;

                    
                    if (speed < resultSpeed[currentIndex]) {
                        resultSpeed[currentIndex] = speed;
                        notchInfo[currentIndex] = notchType;
                    }

                    if (speed < (limitSpeed[currentIndex] - 10)) { // 制限-10km/hになったら再加速
                        isAccel = true;
                    }
                    if (speed > (limitSpeed[currentIndex] - spareSpeed)) { // 制限-2km/hになったら加速終了
                        isAccel = false;
                    }
                    if (speed > limitSpeed[currentIndex] - (spareSpeed/2)) { // 制限-1km/hになったら制動
                        isBrake = true;
                    }
                    if (speed < (limitSpeed[currentIndex] - 5)) { // 制限-5km/hになったら制動終了
                        isBrake = false;
                    }
                    previous = speed;
                }
            }
            
        }

        // 制限加速曲線を計算
        for (let j = 1; j < limitSpeedChangePoint.length; j++)
        {
            let i = limitSpeedChangePoint[j];
            let previous = resultSpeed[i-1];
            while (true)
            {
                if (i >= resultSpeed.length)
                    break;
                let speed = RuncurveV2.getAccelNextSpeed(previous, vehicle, curveInfo[i], gradientInfo[i], tunnelInfo[i]);
                if (previous > resultSpeed[i])
                    break;
                resultSpeed[i] = speed;
                notchInfo[i] = "power";
                previous = speed;
                i++
            }
        }

        // 制限減速曲線を計算
        for (let j = limitSpeedChangePoint.length - 2; j > 0; j--) {
            let i = limitSpeedChangePoint[j];
            let previous = resultSpeed[i+1] || resultSpeed[i];
            while (true)
            {
                if (i < limitSpeedChangePoint[j-1])
                    break;
                let speed = RuncurveV2.getDecelBeforeSpeed(previous, vehicle, curveInfo[i], gradientInfo[i], tunnelInfo[i]);
                if (previous > resultSpeed[i])
                    break;
                resultSpeed[i] = speed;
                notchInfo[i] = "brake";
                previous = speed;
                i--;
            }
        }

        // 修正
        const notchChangePoints = [];
        {
            let before = "";
            notchInfo.forEach((v, i) => {
                if (before != v) {
                    notchChangePoints.push([i, v]);
                }
                before = v;
            });
            notchChangePoints.push([resultSpeed.length-1, ""]);

            for (let i = 0; i < notchChangePoints.length - 1; i++) {
                notchChangePoints[i].push(0);
                for (let j = notchChangePoints[i][0]; j < notchChangePoints[i+1][0] - 1; j++) {
                    notchChangePoints[i][2] += 1 / (resultSpeed[j]/3.6);
                }
            }
            notchChangePoints[notchChangePoints.length-1].push(0);
        }

        return {
            speed: resultSpeed,
            limit: limitSpeed,
            notch: notchChangePoints
        };
    }
}