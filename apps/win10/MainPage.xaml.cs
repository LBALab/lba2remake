using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Gaming.Input;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace win10
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        Gamepad _controller;
        GamepadReading _prevReading;
        DispatcherTimer _dispatcherTimer;

        public MainPage()
        {
            this.InitializeComponent();
        }

        private void _webView_PermissionRequested(WebView sender, WebViewPermissionRequestedEventArgs args)
        {
            if (args.PermissionRequest.PermissionType == WebViewPermissionType.PointerLock)
            {
                args.PermissionRequest.Allow();
            }
        }

        private void Page_Loaded(object sender, RoutedEventArgs e)
        {
            _dispatcherTimer = new DispatcherTimer();
            _dispatcherTimer.Tick += _dispatcherTimer_Tick;
            _dispatcherTimer.Start();
        }

        private void handlerButton(string name, bool pressed)
        {
            if (pressed)
            {
                string isPressed = pressed ? "true" : "false";
                var buttonValue = $"{{detail: {{name: '{name}', isPressed: {isPressed}}}}}";
                string[] js = { $"window.dispatchEvent(new CustomEvent('gamepadbuttonpressed', {buttonValue}))" };
                _webView.InvokeScriptAsync("eval", js);
            }
        }

        private void handlerDpad(string name, double xValue, double yValue, double prevXValue, double prevYValue)
        {
            if (xValue != prevXValue && yValue != prevYValue)
            {
                var dpadValue = $"{{detail: {{x: {xValue}, y: {yValue}, name: '{name}'}}}}";
                string[] js = { $"window.dispatchEvent(new CustomEvent('dpadvaluechanged', {dpadValue}))" };
                _webView.InvokeScriptAsync("eval", js);
            }
        }

        private void _dispatcherTimer_Tick(object sender, object e)
        {
            if (Gamepad.Gamepads.Count > 0)
            {
                _controller = Gamepad.Gamepads.First();
                var reading = _controller.GetCurrentReading();

                handlerDpad("leftStick", reading.LeftThumbstickX, reading.LeftThumbstickY, _prevReading.LeftThumbstickX, _prevReading.LeftThumbstickY);
                handlerDpad("rightStick", reading.RightThumbstickX, reading.RightThumbstickY * -1, _prevReading.RightThumbstickX, _prevReading.RightThumbstickY * -1); // invert axis

                handlerButton("buttonA", reading.Buttons.HasFlag(GamepadButtons.A));
                handlerButton("buttonB", reading.Buttons.HasFlag(GamepadButtons.B));
                handlerButton("buttonX", reading.Buttons.HasFlag(GamepadButtons.X));
                handlerButton("buttonY", reading.Buttons.HasFlag(GamepadButtons.Y));

                handlerButton("leftShoulder", reading.Buttons.HasFlag(GamepadButtons.LeftShoulder));
                handlerButton("rightShoulder", reading.Buttons.HasFlag(GamepadButtons.RightShoulder));

                handlerButton("leftTrigger", reading.LeftTrigger == 1.0);
                handlerButton("rightTrigger", reading.RightTrigger == 1.0);

                handlerButton("dpadUp", reading.Buttons.HasFlag(GamepadButtons.DPadUp));
                handlerButton("dpadDown", reading.Buttons.HasFlag(GamepadButtons.DPadDown));
                handlerButton("dpadLeft", reading.Buttons.HasFlag(GamepadButtons.DPadLeft));
                handlerButton("dpadRight", reading.Buttons.HasFlag(GamepadButtons.DPadRight));

                _prevReading = reading;
            }
        }
    }
}
