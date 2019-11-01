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
                fontSize: 22,
                textAlign: 'left',
                text: tr('Jump')
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
                text: tr('Back')
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
                text: tr('ExitVR')
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
                x: 247,
                y: 94,
                fontSize: 22,
                textAlign: 'right',
                text: tr('WalkRun')
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
                text: tr('ExitVR')
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
    }
}[type]);
