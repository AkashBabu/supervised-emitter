# Benchmark report for Supervised-Emitter 


Name            |  Avg (ms)     |   Min (ms)      |   Max (ms)
:---------------|:--------------|:----------------|:-------------
pub_same_topic  |  31.73  |  16.70  |  61.89  
pub_different_topics  |  29.45  |  19.14  |  67.52  
pub_normal_subscribers_same_topic  |  21.37  |  19.09  |  23.47  
pub_normal_subscribers_different_topics  |  67.69  |  47.91  |  140.38  
pub_same_topic_single_glob_subscriber  |  20.66  |  18.43  |  24.26  
pub_different_topic_single_glob_subscriber  |  42.77  |  19.49  |  185.13  
pub_glob_subscribers_different_topics  |  1456.90  |  1021.20  |  2213.39  
gsub_same_topic  |  29.79  |  17.93  |  49.23  
gsub_different_topics  |  35.31  |  27.93  |  49.70  
sub_same_topic  |  29.21  |  14.21  |  50.02  
sub_different_topics  |  34.22  |  27.51  |  46.48  
gunsub_same_topic  |  31.00  |  18.27  |  48.68  
gunsub_different_topics  |  38.63  |  29.53  |  51.08  
chained_gunsub_same_topics  |  30.96  |  20.61  |  39.93  
chained_gunsub_different_topics  |  42.30  |  33.51  |  64.72  
unsub_same_topic  |  27.24  |  16.48  |  42.35  
unsub_different_topics  |  39.13  |  29.12  |  55.35  
chained_unsub_same_topic  |  31.07  |  23.28  |  42.69  
chained_unsub_different_topics  |  20.97  |  16.56  |  26.99  


