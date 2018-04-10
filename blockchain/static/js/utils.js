/*!
 * --------------------------------------- START OF LICENSE NOTICE ------------------------------------------------------
 * Copyright (c) 2015 Software Robotics Corporation Limited ("Soroco"). All rights reserved.
 *
 * NO WARRANTY. THE PRODUCT IS PROVIDED BY SOROCO "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL SOROCO BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE PRODUCT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 * ---------------------------------------- END OF LICENSE NOTICE -------------------------------------------------------
 *
 *   Primary Author: Nishant Jain <nishant@soroco.com>
 *
 *   Purpose: This file defines few utils functions
 */

/*Function to sort an array of object by a particular key*/
function sortArrayByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

var csrftoken = $('meta[name=csrf-token]').attr('content')

$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    jqXHR.setRequestHeader('X-CSRF-Token', csrftoken);
});

/* Function to escape html characters to prevent XSS attacks.*/
function escapeHtml(unsafe_string) {
    return unsafe_string
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&#34;");
}

/*
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
})
*/
