// ==UserScript==
// @name         Comix Helper
// @namespace    Fear3d
// @version      1.1
// @description  Enables WASD and arrowkey navigation for Comix, and fixes broken keyboard scrolling
// @author       Fear3d
// @match        https://comix.to/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Fear3d/Comix-Helper/main/Comix-Helper.user.js
// @downloadURL  https://raw.githubusercontent.com/Fear3d/Comix-Helper/main/Comix-Helper.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration & State ---
    let scrollStep = GM_getValue('scrollStep', 0.05);
    let scrollPage = GM_getValue('scrollPage', 0.90);
    let stepBehavior = GM_getValue('stepBehavior', 'auto');
    let pageBehavior = GM_getValue('pageBehavior', 'auto');
    let useHotkeys = true;

    // --- Initialization ---
    if (typeof GM_registerMenuCommand === "function") {
        GM_registerMenuCommand("Configure Settings", showSettingsModal);
    }

    /**
     * Toggles hotkey functionality and displays status toast.
     */
    function toggleHotkeys() {
        useHotkeys = !useHotkeys;
        const status = useHotkeys ? 'ENABLED' : 'DISABLED';
        console.log(`Comix Helper: ${status}`);
        showToast(`Comix-Helper Hotkeys: ${status}`, useHotkeys);
    }

    /**
     * Displays a temporary toast notification.
     * @param {string} message - Text to display
     * @param {boolean} isEnabled - Determines background color (green/red)
     */
    function showToast(message, isEnabled) {
        $('#comix-helper-toast').remove();

        const $toast = $(`<div id="comix-helper-toast">${message}</div>`);

        $toast.css({
            'position': 'fixed',
            'bottom': '30px',
            'right': '40px',
            'background-color': isEnabled ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)',
            'color': 'white',
            'padding': '10px 20px',
            'border-radius': '5px',
            'font-family': 'Arial, sans-serif',
            'font-size': '14px',
            'z-index': '99999',
            'box-shadow': '0 2px 5px rgba(0,0,0,0.3)',
            'pointer-events': 'none',
            'transition': 'opacity 0.5s ease'
        });

        $('body').append($toast);

        setTimeout(() => {
            $toast.css('opacity', '0');
            setTimeout(() => $toast.remove(), 500);
        }, 2000);
    }

    /**
     * Renders the configuration modal for user preferences.
     */
    function showSettingsModal() {
        if ($('#comix-helper-settings').length) return;

        const modalHtml = `
            <div id="comix-helper-settings" style="
                 position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                 background: #222; color: #eee; padding: 25px; border-radius: 8px;
                 z-index: 100001; box-shadow: 0 0 20px rgba(0,0,0,0.8); font-family: sans-serif;
                 min-width: 340px; border: 1px solid #444;">

                <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #555; padding-bottom: 10px;">
                    Settings
                </h3>

                <div style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom: 5px;">Step Scroll Speed (0.01 - 1.0)</label>
                    <input type="number" id="ch-step-input" step="0.01" value="${scrollStep}"
                           style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom: 5px;">Page Scroll Amount (0.1 - 1.0)</label>
                    <input type="number" id="ch-page-input" step="0.05" value="${scrollPage}"
                           style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                </div>

                <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">

                <div style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom: 5px;">Step Scroll Behavior (W/S/Arr)</label>
                    <select id="ch-step-behavior" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                        <option value="auto" ${stepBehavior === 'auto' ? 'selected' : ''}>Auto (Default)</option>
                        <option value="instant" ${stepBehavior === 'instant' ? 'selected' : ''}>Instant</option>
                        <option value="smooth" ${stepBehavior === 'smooth' ? 'selected' : ''}>Smooth</option>
                    </select>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="display:block; margin-bottom: 5px;">Page Scroll Behavior (PgUp/Dn)</label>
                    <select id="ch-page-behavior" style="width: 100%; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;">
                        <option value="auto" ${pageBehavior === 'auto' ? 'selected' : ''}>Auto (Default)</option>
                        <option value="instant" ${pageBehavior === 'instant' ? 'selected' : ''}>Instant</option>
                        <option value="smooth" ${pageBehavior === 'smooth' ? 'selected' : ''}>Smooth</option>
                    </select>
                </div>

                <div style="text-align: right;">
                    <button id="ch-cancel-btn" style="padding: 8px 15px; background: #444; color: white; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">Cancel</button>
                    <button id="ch-save-btn" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
                </div>
            </div>
            <div id="comix-helper-overlay" style="position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); z-index: 100000;"></div>
        `;

        $('body').append(modalHtml);

        // Handler: Cancel
        $('#ch-cancel-btn, #comix-helper-overlay').on('click', function() {
            $('#comix-helper-settings, #comix-helper-overlay').remove();
        });

        // Handler: Save
        $('#ch-save-btn').on('click', function() {
            const newStep = parseFloat($('#ch-step-input').val());
            const newPage = parseFloat($('#ch-page-input').val());
            const newStepBehavior = $('#ch-step-behavior').val();
            const newPageBehavior = $('#ch-page-behavior').val();

            if (!isNaN(newStep) && newStep > 0) {
                scrollStep = newStep;
                GM_setValue('scrollStep', newStep);
            }

            if (!isNaN(newPage) && newPage > 0) {
                scrollPage = newPage;
                GM_setValue('scrollPage', newPage);
            }

            if (newStepBehavior) {
                stepBehavior = newStepBehavior;
                GM_setValue('stepBehavior', newStepBehavior);
            }

            if (newPageBehavior) {
                pageBehavior = newPageBehavior;
                GM_setValue('pageBehavior', newPageBehavior);
            }

            $('#comix-helper-settings, #comix-helper-overlay').remove();
            showToast("Settings Saved!", true);
        });
    }

    /**
     * Renders the help overlay with a link to Settings.
     */
    function toggleHelpModal() {
        if ($('#comix-helper-help').length) {
            $('#comix-helper-help').remove();
            return;
        }

        const helpHtml = `
            <div id="comix-helper-help" style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9); color: #fff; padding: 25px; border-radius: 8px;
                z-index: 100000; box-shadow: 0 0 20px rgba(0,0,0,0.7); font-family: sans-serif;
                min-width: 300px; border: 1px solid #444;">
                <h3 style="margin-top: 0; border-bottom: 1px solid #555; padding-bottom: 10px; color: #ddd;">
                    Comix Helper Controls
                </h3>
                <ul style="list-style: none; padding: 0; line-height: 1.6; font-size: 14px;">
                    <li><strong style="color: #66b3ff;">W / Up</strong> : Scroll Up</li>
                    <li><strong style="color: #66b3ff;">S / Down</strong> : Scroll Down</li>
                    <li><strong style="color: #66b3ff;">A / Left</strong> : Previous Chapter</li>
                    <li><strong style="color: #66b3ff;">D / Right</strong> : Next Chapter</li>
                    <li><strong style="color: #66b3ff;">PgUp / PgDn</strong> : Page Scroll</li>
                    <li style="margin-top: 10px;"><strong style="color: #ffc107;">Ctrl+Shift+F</strong> : Toggle Hotkeys</li>
                    <li><strong style="color: #ffc107;">? (Shift + /)</strong> : Toggle this menu</li>
                </ul>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button id="ch-open-settings-btn" style="
                        padding: 8px 16px; 
                        background: #444; 
                        color: white; 
                        border: 1px solid #666; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 13px;">
                        Open Settings
                    </button>
                </div>

                <div style="text-align: center; margin-top: 10px; font-size: 0.8em; color: #888;">
                    (Click outside to close)
                </div>
            </div>
        `;

        $('body').append(helpHtml);

        // Prevent clicks INSIDE the box from bubbling up to the document
        $('#comix-helper-help').on('click', function(e) {
            e.stopPropagation();
        });

        // Handler: Open Settings from Help
        $('#ch-open-settings-btn').on('click', function(e) {
            $('#comix-helper-help').remove();
            showSettingsModal();
        });

        // Close on outside click
        setTimeout(() => {
            $(document).one('click', function() {
                if ($('#comix-helper-help').length) {
                    $('#comix-helper-help').remove();
                }
            });
        }, 10);
    }

    // --- Event Logic ---
    $(document).ready(function() {
        document.addEventListener('keydown', function(evt) {

            // Check that we are on a chapter page
            if (!window.location.href.match(/comix\.to\/title\/.*\/.*-chapter-.*/)) {
                return;
            }

            // Global Hotkey Toggle (Ctrl + Shift + F)
            if (evt.ctrlKey && evt.shiftKey && evt.keyCode === 70) {
                toggleHotkeys();
                evt.preventDefault();
                evt.stopPropagation();
                return;
            }

            if (!useHotkeys) return;

            // Prevent script from hijacking typing, and prevent site from hijacking arrow keys within inputs.
            const targetTagName = evt.target.tagName;
            if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') {
                evt.target.addEventListener('keydown', function(e) {
                    e.stopPropagation();
                }, { once: true });
                return;
            }

            // Navigation Handling
            let hotkeyUsed = false;
            const viewer = document.querySelector('div.viewer-wrapper');

            switch (evt.keyCode) {
                case 37: // Left Arrow
                    if (!evt.ctrlKey && !evt.shiftKey) {
                        $('button:has(i.fa-sharp.fa-solid.fa-chevron-left)')[0].click();
                        hotkeyUsed = true;
                    }
                    break;
                case 39: // Right Arrow
                    if (!evt.ctrlKey && !evt.shiftKey) {
                        $('button:has(i.fa-sharp.fa-solid.fa-chevron-right)')[0].click();
                        hotkeyUsed = true;
                    }
                    break;
                case 65: // A
                    if (!evt.ctrlKey && !evt.shiftKey) {
                        $('button:has(i.fa-sharp.fa-solid.fa-chevron-left)')[0].click();
                        hotkeyUsed = true;
                    }
                    break;
                case 68: // D
                    if (!evt.ctrlKey && !evt.shiftKey) {
                        $('button:has(i.fa-sharp.fa-solid.fa-chevron-right)')[0].click();
                        hotkeyUsed = true;
                    }
                    break;
                case 87: // W
                case 38: // Up Arrow
                    if (viewer) {
                        const scrollAmount = viewer.clientHeight * scrollStep * -1;
                        viewer.scrollBy({top: scrollAmount, behavior: stepBehavior});
                        hotkeyUsed = true;
                    }
                    break;
                case 83: // S
                case 40: // Down Arrow
                    if (viewer) {
                        const scrollAmount = viewer.clientHeight * scrollStep;
                        viewer.scrollBy({top: scrollAmount, behavior: stepBehavior});
                        hotkeyUsed = true;
                    }
                    break;
                case 33: // Page Up
                    if (viewer) {
                        const scrollAmount = viewer.clientHeight * scrollPage * -1;
                        viewer.scrollBy({top: scrollAmount, behavior: pageBehavior});
                        hotkeyUsed = true;
                    }
                    break;
                case 34: // Page Down
                    if (viewer) {
                        const scrollAmount = viewer.clientHeight * scrollPage;
                        viewer.scrollBy({top: scrollAmount, behavior: pageBehavior});
                        hotkeyUsed = true;
                    }
                    break;
                case 191: // ? (Shift + /)
                    if (evt.shiftKey) {
                        toggleHelpModal();
                        hotkeyUsed = true;
                    }
                    break;
            }

            // Prevent default action if a hotkey was used
            if (hotkeyUsed) {
                evt.preventDefault();
                evt.stopPropagation();
            }

        }, true);
    });
})();