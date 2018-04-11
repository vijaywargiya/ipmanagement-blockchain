# --------------------------------------- START OF LICENSE NOTICE ------------------------------------------------------
# Copyright (c) 2018 Soroco Private Limited. All rights reserved.
#
# NO WARRANTY. THE PRODUCT IS PROVIDED BY SOROCO "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
# SHALL SOROCO BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
# BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
# NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE PRODUCT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
# DAMAGE.
# ---------------------------------------- END OF LICENSE NOTICE -------------------------------------------------------
#
#   Primary Author: Shivam Vijaywargiya <shivam.vijaywargiya@soroco.com>
#
#   Purpose: A short description of the purpose of this source file ...
import uuid
from urllib.parse import urlparse

import requests

address = 'https://blockchain-property.herokuapp.com'
print(address)
nodes = []
parsed_url = urlparse(address)
print(parsed_url)
if parsed_url.netloc:
    nodes.append(parsed_url.netloc)
elif parsed_url.path:
    # Accepts an URL without scheme like '192.168.0.5:5000'.
    nodes.append(parsed_url.path)

print(nodes)
for node in nodes:
    response = requests.get('http://{}/chain'.format(node))
    print(response.json())