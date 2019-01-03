var vueApp = new Vue({
    el: '#vueApp',
    data: {
        messages: [
        ],
        message: {}
    },
    created: function () {
        var socket = io();
        socket.on('status', function (msg) {
            vueApp.message.id = socket.id;
            vueApp.messages.push(msg);
            Vue.prototype.$socket = socket;
        });
        socket.on('message', function (msg) {
            vueApp.messages.push(msg);
        });
    },
    methods: {
        onMessage: function () {
            this.$socket.emit('message', this.message.msg);
            this.message.msg = null;
        }
    }
});