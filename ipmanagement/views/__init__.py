from ipmanagement.backend import Backend

backend = Backend()

MINE_SEMAPHORE = 1


def wait_mine():
    global MINE_SEMAPHORE
    while MINE_SEMAPHORE <= 0:
        pass
    MINE_SEMAPHORE -= 1


def release_mine():
    global MINE_SEMAPHORE
    MINE_SEMAPHORE += 1
