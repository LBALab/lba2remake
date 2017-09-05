//
//  ViewController.swift
//  LBA2
//
//  Created by Adrien on 28/07/2016.
//  Copyright © 2016 Adrien Grandemange. All rights reserved.
//

import UIKit
import WebKit
import Foundation
import GameController

class ViewController: UIViewController {
    
    var webView : WKWebView?
    
    override func loadView() {
        webView = WKWebView()
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        NotificationCenter.default.addObserver(self, selector: #selector(controllerConnected), name: NSNotification.Name.GCControllerDidConnect, object: nil)
        
        let defaults = UserDefaults.standard
        var urlStr = defaults.string(forKey: "url")
        if urlStr == nil {
            urlStr = "http://192.168.0.12:8080/#scene=42&useVR=true"
        }
        let url = URL(string: urlStr!)
        let req = URLRequest(url: url!)
        self.webView!.load(req)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func handleButton(button: GCControllerButtonInput?, name: String) {
        button?.pressedChangedHandler = {
            (button: GCControllerButtonInput, value: Float, pressed: Bool) in
            let buttonValue = "{detail: {name: '\(name)', isPressed: \(pressed)}}"
            let js = "window.dispatchEvent(new CustomEvent('gamepadbuttonpressed', \(buttonValue)))"
            self.webView?.evaluateJavaScript(js)
        }
    }
    
    func handleDpad(dpad: GCControllerDirectionPad?) {
        dpad?.valueChangedHandler = {
            (dpad: GCControllerDirectionPad, xValue: Float, yValue: Float) in
            let dpadValue = "{detail: {x: \(xValue), y: \(yValue)}}"
            let js = "window.dispatchEvent(new CustomEvent('dpadvaluechanged', \(dpadValue)))"
            self.webView?.evaluateJavaScript(js)
        }
    }

    func controllerConnected(notification: Notification) {
        let gamepad = GCController.controllers()[0].extendedGamepad
        handleDpad(dpad: gamepad?.leftThumbstick);
        handleButton(button: gamepad?.buttonA, name: "buttonA");
        handleButton(button: gamepad?.buttonB, name: "buttonB");
        handleButton(button: gamepad?.buttonX, name: "buttonX");
        handleButton(button: gamepad?.buttonY, name: "buttonY");
        handleButton(button: gamepad?.leftShoulder, name: "leftShoulder");
        handleButton(button: gamepad?.rightShoulder, name: "rightShoulder");
        handleButton(button: gamepad?.leftTrigger, name: "leftTrigger");
        handleButton(button: gamepad?.rightTrigger, name: "rightTrigger");
        handleButton(button: gamepad?.dpad.left, name: "dpadLeft");
        handleButton(button: gamepad?.dpad.right, name: "dpadRight");
        handleButton(button: gamepad?.dpad.up, name: "dpadUp");
        handleButton(button: gamepad?.dpad.down, name: "dpadDown");
    }

}
