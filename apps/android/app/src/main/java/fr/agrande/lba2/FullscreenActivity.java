package fr.agrande.lba2;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class FullscreenActivity extends AppCompatActivity {
    WebView mWebView;
    float prevX = -1, prevY= -1; // when using mouse pointer to keep track of previous position

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_fullscreen);
        mWebView = (WebView)findViewById(R.id.webView);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        WebView.setWebContentsDebuggingEnabled(true);
        mWebView.loadUrl("http://adri42.bitbucket.org/lba2");
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent event) {
        if(event.isFromSource(InputDevice.SOURCE_CLASS_JOYSTICK)) {
            if (event.getAction() == MotionEvent.ACTION_MOVE) {
                float x = event.getAxisValue(MotionEvent.AXIS_X);
                float y = -event.getAxisValue(MotionEvent.AXIS_Y);
                mWebView.loadUrl(String.format("javascript:window.dispatchEvent(new CustomEvent('dpadvaluechanged', {detail: {x: %s, y: %s}}))", x, y));
            }
        }
        if(event.isFromSource(InputDevice.SOURCE_CLASS_POINTER)) {
            if (event.getAction() == MotionEvent.ACTION_HOVER_MOVE) {
                float newX = event.getAxisValue(MotionEvent.AXIS_X);
                float newY = -event.getAxisValue(MotionEvent.AXIS_Y);
                if (prevX != -1 && prevY != -1) {
                    float x = newX - prevX;
                    float y = newY - prevY;
                    mWebView.loadUrl(String.format("javascript:window.dispatchEvent(new CustomEvent('dpadvaluechanged', {detail: {x: %s, y: %s}}))", x, y));
                }
                prevX = newX;
                prevY = newY;
            }
        }
        return true;
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if ((event.getSource() & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD) {
            if (event.getRepeatCount() == 0) {
                String buttonName = null;
                boolean isPressed = event.getAction() == KeyEvent.ACTION_DOWN;
                switch (event.getKeyCode()) {
                    case KeyEvent.KEYCODE_BUTTON_A:
                        buttonName = "buttonA";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_B:
                        buttonName = "buttonB";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_X:
                        buttonName = "buttonX";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_Y:
                        buttonName = "buttonY";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_L1:
                        buttonName = "leftShoulder";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_R1:
                        buttonName = "rightShoulder";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_L2:
                        buttonName = "leftTrigger";
                        break;
                    case KeyEvent.KEYCODE_BUTTON_R2:
                        buttonName = "rightTrigger";
                        break;
                    default:
                        break;
                }
                if (buttonName != null) {
                    mWebView.loadUrl(String.format("javascript:window.dispatchEvent(new CustomEvent('gamepadbuttonpressed', {detail: {name: '%s', isPressed: %s}}))", buttonName, isPressed));
                }
            }
            return true;
        }
        return false;
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            getWindow().getDecorView().setSystemUiVisibility(
                    mWebView.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | mWebView.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | mWebView.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | mWebView.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | mWebView.SYSTEM_UI_FLAG_FULLSCREEN
                            | mWebView.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }
}
