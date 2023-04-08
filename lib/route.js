// 駅を表すクラス
class Station
{
    constructor(name, position, stopType, maxSpeed)
    {
        // 駅名 "駅名"
        this.name = name;
        // 駅の位置[m]
        this.position = position;
        // 駅種別 0:停車 1:通過
        this.stopType = stopType;
        // 駅最高速度[km/h]
        this.maxSpeed = maxSpeed;
    }
}

// 路線を表すクラス
class Route {
    constructor(name, curves, gradients, limitSpeeds, tunnels, stations) {
        curves.sort();
        gradients.sort();
        limitSpeeds.sort();
        tunnels.sort();

        // 路線名 "路線名"
        this.name = name;
        // 曲線データの配列 [ [開始距離, 終了距離, 曲線半径(m)] ]
        this.curves = curves;
        // 勾配データの配列 [ [開始距離, 終了距離, 勾配(‰)] ]
        this.gradients = gradients;
        // 制限速度データの配列 [ [開始距離, 終了距離, 制限速度(km/h)] ]
        this.limitSpeeds = limitSpeeds;
        // トンネルデータの配列 [ [開始距離, 終了距離, トンネル種別] ]
        this.tunnels = tunnels;
        // 駅データの配列
        this.stations = stations;
    }
}

function getCurveSpeed(radius)
{
    return Math.sqrt(radius) * 3.5;
}