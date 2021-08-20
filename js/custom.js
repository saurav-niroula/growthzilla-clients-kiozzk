(function() {
    "use strict";
    var btnText,
        jQuery = window.jQuery,
        d = new Date(),
        leadVar = "leadSrc",
        qParams = {},
        getCookie = function(cname) {
            var name = cname + "=",
                ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i+=1) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return "";
        },
        setCookie = function(cname, cvalue, exdays){
            var d = new Date(), expires;
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },
        checkLead = function(){
            var urlparts = document.location.href.split("?"),
                qparts = urlparts && urlparts.length > 1 && urlparts[1],
                leadSrc = getCookie(leadVar),
                newLead;
            if(qparts && qparts.length) {
                qparts.split("&").forEach(function(p) {
                    var kv = p.split("="),
                        k = kv && kv.length && kv[0],
                        v = kv && kv.length > 1 && kv[1];
                    qParams[k] = v && v.trim();
                });
            }

            if(qParams[leadVar]) {
                newLead = leadSrc ? leadSrc + ", " + qParams[leadVar] : qParams[leadVar];
                setCookie(leadVar, newLead, 7);
            }
        },
        makeHash = function(val) {
            return val.split("").map(function (v, i) {
                return val.charCodeAt(i).toString(16);
            }).join("").replace(/\d/ig, '');
        },
        isFormFieldValid = function(v, k) {
            var kk = k.replace(" ", ""),
                validate = {
                    "FullName": function(){
                        return v.length > 1;
                    },
                    "EmailAddress": function(){
                        var items = v.match(/(.{2,})@([a-zA-Z0-9_-]{2,})\.([.a-zA-Z0-9]{2,})/);
                        return items && items.length;
                    },
                    "PhoneNumber": function(){
                        var items = v.replace(/\D/ig, '');
                        return items && items.length >= 10;
                    },
                    "BusinessName": function(){
                        return v.length > 2;
                    },
                    "Message": function(){
                        return v.trim().length > 3;
                    }
                };
            return k && v && v.length && (validate[kk] ? validate[kk]() : v.length);
        },
        highlightAndFocus = function(el, focus){
            jQuery(el).addClass("formerrorhighlight");
            if(focus) {
                jQuery(el).focus();
            }
        },
        handleFormElementBlur = function(e) {
            if(jQuery(this).val().length) {
                jQuery(this).removeClass("formerrorhighlight");
            }
        },
        handleSubFormSubmission = function(e) {
            e.preventDefault();
        },
        handleFormSubmission = function(e) {
            e.preventDefault();
            var success = 0,
                count = 0,
                data = {},
                inputs = "div.landing-request-demo-form-div form input",
                tarea = "div.landing-request-demo-form-div form textarea",
                btn = jQuery("div.landing-request-demo-form-div form button"),
                hasTarea = jQuery(tarea),
                tk = hasTarea && hasTarea.attr("placeholder"),
                message = hasTarea.val(),
                dUtc = d.toISOString(),
                dLocal = d.toDateString(),
                focus = true;

            jQuery(inputs).each(function (k, item) {
                var key = jQuery(item).attr("placeholder"),
                    val = jQuery(item).val();
                if (key) {
                    if (val && isFormFieldValid(val, key)) {
                        data[key] = val;
                        success += 1;
                    } else {
                        highlightAndFocus(item, focus);
                        focus = false;
                    }
                    count += 1;
                }
            });

            if (hasTarea && hasTarea.length) {
                count += 1;
                if (message && isFormFieldValid(message, tk)) {
                    data[tk] = message;
                    success += 1;
                } else {
                    highlightAndFocus(hasTarea, focus);
                }
            }

            //success = data[fname] && data[phone] && data[biz];

            if (success && success === count) {
                data["Current Page"] = window.location.href;
                data["Page Hash"] = makeHash(data["Current Page"]  + dUtc);
                data["Date UTC"] = dUtc;
                data.Date = dLocal;
                data["Lead Source"] = getCookie(leadVar) || "Direct";

                if(btn && btn.length) {
                    btn.prop("disabled", true);
                }
                jQuery.ajax({
                    type: "POST",
                    url: "message.php",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    success: function (d) {
                        if(btn && btn.length) {
                            btn.prop("disabled", false);
                        }
                        if(d && d.status){
                            window.location.href="thank-you";
                            return;
                        }
                        window.alert("Message not sent. Please try again later!");
                    },
                    failure: function (e) {
                        if(btn && btn.length) {
                            btn.prop("disabled", false);
                        }
                        window.alert("Message not sent. Please try again later!");
                    }
                });
            }
        };

    jQuery(document).ready(function ($) {
        $('.main-navigation').meanmenu();
    });

    var mybutton = document.getElementById("scroll-top");

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    // When the user scrolls down 20px from the top of the document, show the button
    window.onscroll = scrollFunction;

    // When the user clicks on the button, scroll to the top of the document
    window.topFunction = function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    // Check Lead on load
    checkLead();
    jQuery(document).on("click", "div.landing-request-demo-form-div form button.landing-button", handleFormSubmission);
    jQuery(document).on("keyup", "div.landing-request-demo-form-div form input, div.landing-request-demo-form-div form textarea", handleFormElementBlur);
}());