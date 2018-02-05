from blockchain.routes import app


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port
    app.run(debug=True, use_reloader=True)
    #app.run(host='127.0.0.1', port=10001)


