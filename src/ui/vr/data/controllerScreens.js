import {tr} from '../../../lang';

export default type => ({
    oculustouch: {
        width: 1200,
        height: 700,
        angle: 45,
        x: 1200,
        z: 720,
        labels: [
            {
                name: 'LThumbStick',
                x: 402,
                y: 75,
                fontSize: 22,
                textAlign: 'left',
                text: tr('WalkRun')
            },
            {
                name: 'RThumbStick',
                x: 775,
                y: 72,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Nothing')
            },
            {
                name: 'LTrigger',
                x: 387,
                y: 492,
                fontSize: 20,
                textAlign: 'left',
                text: tr('Fight/Jump')
            },
            {
                name: 'RTrigger',
                x: 834,
                y: 492,
                fontSize: 22,
                textAlign: 'right',
                text: tr('CenterCamera')
            },
            {
                name: 'LGrip',
                x: 385,
                y: 547,
                fontSize: 22,
                textAlign: 'left',
                text: tr('HoldToRun')
            },
            {
                name: 'RGrip',
                x: 843,
                y: 544,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Nothing')
            },
            {
                name: 'X',
                x: 435,
                y: 355,
                fontSize: 20,
                textAlign: 'left',
                text: tr('Action')
            },
            {
                name: 'Y',
                x: 438,
                y: 313,
                fontSize: 20,
                textAlign: 'left',
                text: tr('Nothing')
            },
            {
                name: 'A',
                x: 769,
                y: 355,
                fontSize: 20,
                textAlign: 'right',
                text: tr('Action')
            },
            {
                name: 'B',
                x: 766,
                y: 309,
                fontSize: 20,
                textAlign: 'right',
                text: tr('SwitchBehaviour')
            },
            {
                name: 'Start',
                x: 112,
                y: 271,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Back')
            },
            {
                name: 'Oculus',
                x: 1063,
                y: 297,
                fontSize: 22,
                textAlign: 'left',
                text: 'Oculus\nHome'
            },
        ]
    },
    oculusgo: {
        width: 1000,
        height: 1000,
        angle: 45,
        x: 1000,
        z: 700,
        labels: [
            {
                name: 'TouchPad',
                x: 145,
                y: 114,
                fontSize: 20,
                textAlign: 'center',
                text: tr('MoveSwitchAction')
            },
            {
                name: 'Trigger',
                x: 765,
                y: 120,
                fontSize: 22,
                textAlign: 'left',
                text: tr('CenterCamera')
            },
            {
                name: 'Back',
                x: 223,
                y: 373,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Back')
            },
            {
                name: 'Oculus',
                x: 726,
                y: 414,
                fontSize: 22,
                textAlign: 'left',
                text: 'Oculus Home'
            },
        ]
    },
    htcvive: {
        width: 1250,
        height: 500,
        angle: 45,
        x: 1250,
        z: 700,
        labels: [
            {
                name: 'LMenu',
                x: 240,
                y: 40,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Nothing')
            },
            {
                name: 'RMenu',
                x: 1008,
                y: 80,
                fontSize: 22,
                textAlign: 'left',
                text: tr('Action')
            },
            {
                name: 'LTrackpad',
                x: 220,
                y: 109,
                fontSize: 22,
                textAlign: 'right',
                text: tr('WalkRun')
            },
            {
                name: 'RTrackpad',
                x: 1029,
                y: 149,
                fontSize: 18,
                textAlign: 'left',
                text: tr('TapToSwitchBehaviour')
            },
            {
                name: 'LTrigger',
                x: 481,
                y: 279,
                fontSize: 20,
                textAlign: 'left',
                text: tr('Fight/Jump')
            },
            {
                name: 'RTrigger',
                x: 767,
                y: 319,
                fontSize: 22,
                textAlign: 'right',
                text: tr('CenterCamera')
            },
            {
                name: 'LGrip',
                x: 449,
                y: 371,
                fontSize: 22,
                textAlign: 'left',
                text: tr('HoldToRun')
            },
            {
                name: 'RGrip',
                x: 798,
                y: 411,
                fontSize: 22,
                textAlign: 'right',
                text: tr('Nothing')
            },
            {
                name: 'LSteam',
                x: 218,
                y: 185,
                fontSize: 22,
                textAlign: 'right',
                text: tr('SteamMenu')
            },
            {
                name: 'RSteam',
                x: 1030,
                y: 225,
                fontSize: 22,
                textAlign: 'left',
                text: tr('SteamMenu')
            },
        ]
    }
}[type]);
